import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import { initialProducts, productCategories } from '../data/initialProducts'

const STORAGE_KEYS = {
  products: 'prime-burger-products',
  categories: 'prime-burger-categories',
  settings: 'prime-burger-site-settings',
}

const COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  settings: 'siteSettings',
}

const SETTINGS_DOC_ID = 'contact'

const defaultContact = {
  phone: '+57 300 000 0000',
  whatsappLink: '',
  email: 'contacto@primeburger.com',
  address: 'Calle 123 #45-67',
  instagram: {
    name: '@primeburger',
    link: 'https://instagram.com/primeburger',
  },
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getLocalStorageItem(key, fallback) {
  if (typeof localStorage === 'undefined') {
    return fallback
  }

  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function setLocalStorageItem(key, value) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeProduct(record, index = 0) {
  return {
    id: record.id ?? generateId(),
    title: String(record.title ?? '').trim(),
    description: String(record.description ?? '').trim(),
    price: Number(record.price ?? 0),
    image: String(record.image ?? '').trim(),
    category: String(record.category ?? '').trim(),
    createdAt: Number(record.createdAt ?? index),
  }
}

function normalizeCategory(record, index = 0) {
  return {
    id: record.id ?? generateId(),
    name: String(record.name ?? '').trim(),
    createdAt: Number(record.createdAt ?? index),
  }
}

function normalizeContact(record = {}) {
  const nextContact = {
    ...defaultContact,
    ...record,
  }

  if (record.instagram) {
    nextContact.instagram = {
      ...defaultContact.instagram,
      ...record.instagram,
    }
  }

  return nextContact
}

function mapProductSnapshot(snapshot) {
  const data = snapshot.data()
  return normalizeProduct({ ...data, id: snapshot.id, createdAt: data.createdAt })
}

function mapCategorySnapshot(snapshot) {
  const data = snapshot.data()
  return normalizeCategory({ ...data, id: snapshot.id, createdAt: data.createdAt })
}

async function seedProductsIfNeeded() {
  if (!isFirebaseConfigured) {
    return
  }

  const snapshot = await getDocs(collection(db, COLLECTIONS.products))
  if (!snapshot.empty) {
    return
  }

  const batch = writeBatch(db)
  initialProducts.forEach((product, index) => {
    const productRef = doc(collection(db, COLLECTIONS.products))
    batch.set(productRef, normalizeProduct({ ...product, createdAt: index }, index))
  })

  await batch.commit()
}

async function seedCategoriesIfNeeded() {
  if (!isFirebaseConfigured) {
    return
  }

  const snapshot = await getDocs(collection(db, COLLECTIONS.categories))
  if (!snapshot.empty) {
    return
  }

  const batch = writeBatch(db)
  productCategories.forEach((category, index) => {
    const categoryRef = doc(collection(db, COLLECTIONS.categories))
    batch.set(categoryRef, normalizeCategory({ ...category, createdAt: index }, index))
  })

  await batch.commit()
}

async function seedSettingsIfNeeded() {
  if (!isFirebaseConfigured) {
    return
  }

  const settingsRef = doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID)
  const snapshot = await getDoc(settingsRef)

  if (snapshot.exists()) {
    return
  }

  await setDoc(settingsRef, defaultContact)
}

function sortByCreatedAt(items) {
  return [...items].sort((left, right) => (left.createdAt ?? 0) - (right.createdAt ?? 0))
}

export async function subscribeToProducts(callback) {
  if (!isFirebaseConfigured) {
    callback(sortByCreatedAt(getLocalStorageItem(STORAGE_KEYS.products, initialProducts.map((product, index) => normalizeProduct(product, index)))))
    return () => {}
  }

  await seedProductsIfNeeded()

  const unsubscribe = onSnapshot(collection(db, COLLECTIONS.products), (snapshot) => {
    const nextProducts = sortByCreatedAt(snapshot.docs.map(mapProductSnapshot))
    callback(nextProducts)
  })

  return unsubscribe
}

export async function createProduct(product) {
  const payload = normalizeProduct({ ...product, createdAt: Date.now() })

  if (!isFirebaseConfigured) {
    const nextProducts = sortByCreatedAt([
      ...getLocalStorageItem(STORAGE_KEYS.products, initialProducts.map((item, index) => normalizeProduct(item, index))),
      payload,
    ])
    setLocalStorageItem(STORAGE_KEYS.products, nextProducts)
    return payload
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.products), payload)
  return { ...payload, id: docRef.id }
}

export async function updateProduct(product) {
  const payload = normalizeProduct(product, product.createdAt ?? Date.now())

  if (!isFirebaseConfigured) {
    const nextProducts = sortByCreatedAt(
      getLocalStorageItem(STORAGE_KEYS.products, initialProducts.map((item, index) => normalizeProduct(item, index))).map((item) =>
        item.id === payload.id ? { ...payload, createdAt: item.createdAt ?? payload.createdAt } : item,
      ),
    )
    setLocalStorageItem(STORAGE_KEYS.products, nextProducts)
    return payload
  }

  await setDoc(doc(db, COLLECTIONS.products, payload.id), payload)
  return payload
}

export async function deleteProduct(productId) {
  if (!isFirebaseConfigured) {
    const nextProducts = getLocalStorageItem(STORAGE_KEYS.products, initialProducts.map((product, index) => normalizeProduct(product, index))).filter(
      (product) => product.id !== productId,
    )
    setLocalStorageItem(STORAGE_KEYS.products, nextProducts)
    return
  }

  await deleteDoc(doc(db, COLLECTIONS.products, productId))
}

export async function subscribeToCategories(callback) {
  if (!isFirebaseConfigured) {
    callback(sortByCreatedAt(getLocalStorageItem(STORAGE_KEYS.categories, productCategories.map((category, index) => normalizeCategory(category, index)))))
    return () => {}
  }

  await seedCategoriesIfNeeded()

  const unsubscribe = onSnapshot(collection(db, COLLECTIONS.categories), (snapshot) => {
    const nextCategories = sortByCreatedAt(snapshot.docs.map(mapCategorySnapshot))
    callback(nextCategories)
  })

  return unsubscribe
}

export async function createCategory(category) {
  const payload = normalizeCategory({ ...category, createdAt: Date.now() })

  if (!isFirebaseConfigured) {
    const currentCategories = getLocalStorageItem(STORAGE_KEYS.categories, productCategories.map((item, index) => normalizeCategory(item, index)))
    const nextCategories = sortByCreatedAt([...currentCategories, payload])
    setLocalStorageItem(STORAGE_KEYS.categories, nextCategories)
    return payload
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.categories), payload)
  return { ...payload, id: docRef.id }
}

export async function updateCategory(category) {
  const payload = normalizeCategory(category, category.createdAt ?? Date.now())

  if (!isFirebaseConfigured) {
    const currentCategories = getLocalStorageItem(STORAGE_KEYS.categories, productCategories.map((item, index) => normalizeCategory(item, index)))
    const nextCategories = sortByCreatedAt(
      currentCategories.map((item) => (item.id === payload.id ? { ...payload, createdAt: item.createdAt ?? payload.createdAt } : item)),
    )
    setLocalStorageItem(STORAGE_KEYS.categories, nextCategories)
    return payload
  }

  await setDoc(doc(db, COLLECTIONS.categories, payload.id), payload)
  return payload
}

export async function deleteCategory(categoryId) {
  if (!isFirebaseConfigured) {
    const currentCategories = getLocalStorageItem(STORAGE_KEYS.categories, productCategories.map((category, index) => normalizeCategory(category, index)))
    const nextCategories = currentCategories.filter((category) => category.id !== categoryId)
    setLocalStorageItem(STORAGE_KEYS.categories, nextCategories)
    return
  }

  await deleteDoc(doc(db, COLLECTIONS.categories, categoryId))
}

export async function subscribeToContactSettings(callback) {
  if (!isFirebaseConfigured) {
    const savedSettings = getLocalStorageItem(STORAGE_KEYS.settings, { contact: defaultContact })
    callback({ contact: normalizeContact(savedSettings.contact) })
    return () => {}
  }

  await seedSettingsIfNeeded()

  const settingsRef = doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID)
  const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({ contact: defaultContact })
      return
    }

    callback({ contact: normalizeContact(snapshot.data()) })
  })

  return unsubscribe
}

export async function saveContactSettings(contact) {
  const nextSettings = { contact: normalizeContact(contact) }

  if (!isFirebaseConfigured) {
    setLocalStorageItem(STORAGE_KEYS.settings, nextSettings)
    return nextSettings
  }

  await setDoc(doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID), nextSettings.contact, { merge: true })
  return nextSettings
}
