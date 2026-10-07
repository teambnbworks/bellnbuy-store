import { useEffect, useMemo, useState } from 'react'
import type {
  ChangeEvent,
  CSSProperties,
  FormEvent,
} from 'react'
import logo from './assets/BNB-10-10.png'
import { supabase } from './supabase'

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string | null
  product_type: string | null
  is_featured: boolean
  is_new_arrival: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

type VariantDraft = {
  size: string
  color: string
  stock: number
}

type OrderStatus = 'new' | 'confirmed' | 'delivered'

type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_area: string | null
  delivery_city: string
  delivery_province: string | null
  delivery_postal_code: string | null
  subtotal: number
  delivery_fee: number
  total_amount: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

const emptyVariant = (): VariantDraft => ({
  size: '',
  color: '',
  stock: 0,
})

const formatPrice = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString('en-PK')}`

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'products' | 'add-product' | 'orders'
  >('dashboard')

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const [productName, setProductName] = useState('')
  const [productSlug, setProductSlug] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productComparePrice, setProductComparePrice] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [productType, setProductType] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNewArrival, setIsNewArrival] = useState(true)
  const [isActive, setIsActive] = useState(true)

  const [variants, setVariants] = useState<VariantDraft[]>([
    emptyVariant(),
  ])

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [productSaving, setProductSaving] = useState(false)
  const [productError, setProductError] = useState('')
  const [productMessage, setProductMessage] = useState('')
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  )

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const [orderTab, setOrderTab] = useState<
    'new' | 'confirmed' | 'delivered' | 'all'
  >('new')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      setLoggedIn(Boolean(session))
      setLoading(false)
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loggedIn) {
      void loadProducts()
    }
  }, [loggedIn])

  useEffect(() => {
    if (loggedIn && activeSection === 'orders') {
      void loadOrders()
    }
  }, [loggedIn, activeSection])

  const loadProducts = async () => {
    setProductsLoading(true)
    setError('')

    const { data, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (productsError) {
      setError(productsError.message)
      setProductsLoading(false)
      return
    }

    setProducts((data ?? []) as Product[])
    setProductsLoading(false)
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    setOrderError('')

    const [ordersResult, itemsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('order_items')
        .select('*')
        .order('created_at', { ascending: true }),
    ])

    if (ordersResult.error) {
      setOrderError(ordersResult.error.message)
      setOrdersLoading(false)
      return
    }

    if (itemsResult.error) {
      setOrderError(itemsResult.error.message)
      setOrdersLoading(false)
      return
    }

    setOrders((ordersResult.data ?? []) as Order[])
    setOrderItems((itemsResult.data ?? []) as OrderItem[])
    setOrdersLoading(false)
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    setLoggedIn(true)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()

    setLoggedIn(false)
    setActiveSection('dashboard')
    setOrders([])
    setOrderItems([])
  }

  const handleImageFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    setImageFiles(files)

    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const updateVariant = (
    index: number,
    field: keyof VariantDraft,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant, variantIndex) => {
        if (variantIndex !== index) {
          return variant
        }

        if (field === 'stock') {
          return {
            ...variant,
            stock: Number(value) || 0,
          }
        }

        return {
          ...variant,
          [field]: value,
        }
      }),
    )
  }

  const addVariant = () => {
    setVariants((current) => [...current, emptyVariant()])
  }

  const removeVariant = (index: number) => {
    setVariants((current) => {
      if (current.length === 1) {
        return current
      }

      return current.filter((_, variantIndex) => variantIndex !== index)
    })
  }

  const resetProductForm = () => {
    setProductName('')
    setProductSlug('')
    setProductDescription('')
    setProductPrice('')
    setProductComparePrice('')
    setProductCategory('')
    setProductType('')
    setIsFeatured(false)
    setIsNewArrival(true)
    setIsActive(true)
    setVariants([emptyVariant()])
    setImageFiles([])
    setImagePreviews([])
  }

  const handleCreateProduct = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setProductError('')
    setProductMessage('')

    if (!productName.trim()) {
      setProductError('Product name is required.')
      return
    }

    if (!productSlug.trim()) {
      setProductError('Product slug is required.')
      return
    }

    const price = Number(productPrice)

    if (!Number.isFinite(price) || price <= 0) {
      setProductError('Please enter a valid product price.')
      return
    }

    if (imageFiles.length === 0) {
      setProductError('Please select at least one product image.')
      return
    }

    setProductSaving(true)

    try {
      const {
        data: product,
        error: createProductError,
      } = await supabase
        .from('products')
        .insert({
          name: productName.trim(),
          slug: productSlug.trim(),
          description: productDescription.trim() || null,
          price,
          compare_at_price:
            productComparePrice.trim() !== ''
              ? Number(productComparePrice)
              : null,
          category: productCategory.trim() || null,
          product_type: productType.trim() || null,
          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          is_active: isActive,
        })
        .select('*')
        .single()

      if (createProductError || !product) {
        throw new Error(
          createProductError?.message ?? 'Could not create product.',
        )
      }

      const validVariants = variants.filter(
        (variant) => variant.size.trim() || variant.color.trim(),
      )

      if (validVariants.length > 0) {
        const variantRows = validVariants.map((variant) => ({
          product_id: product.id,
          size: variant.size.trim() || null,
          color: variant.color.trim() || null,
          stock: Math.max(0, Number(variant.stock) || 0),
        }))

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantRows)

        if (variantsError) {
          await supabase.from('products').delete().eq('id', product.id)
          throw new Error(variantsError.message)
        }
      }

      const uploadedImages: Array<{
        image_url: string
        alt_text: string
        sort_order: number
        is_primary: boolean
      }> = []

      for (let index = 0; index < imageFiles.length; index += 1) {
        const file = imageFiles[index]

        const extension =
          file.name.split('.').pop()?.toLowerCase() || 'jpg'

        const filePath = `${product.id}/${Date.now()}-${index}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type || undefined,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        uploadedImages.push({
          image_url: publicUrl,
          alt_text: product.name,
          sort_order: index,
          is_primary: index === 0,
        })
      }

      if (uploadedImages.length > 0) {
        const imageRows = uploadedImages.map((image) => ({
          product_id: product.id,
          ...image,
        }))

        const { error: imageInsertError } = await supabase
          .from('product_images')
          .insert(imageRows)

        if (imageInsertError) {
          throw new Error(imageInsertError.message)
        }
      }

      setProductMessage('Product created successfully.')
      resetProductForm()
      await loadProducts()
    } catch (createError) {
      setProductError(
        createError instanceof Error
          ? createError.message
          : 'Something went wrong while creating the product.',
      )
    } finally {
      setProductSaving(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${product.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setDeletingProductId(product.id)
    setError('')

    try {
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.id)

      if (imagesError) {
        throw new Error(imagesError.message)
      }

      const storagePaths: string[] = []

      for (const image of (images ?? []) as Array<{
        image_url: string
      }>) {
        const marker = '/storage/v1/object/public/product-images/'

        if (image.image_url.includes(marker)) {
          storagePaths.push(image.image_url.split(marker)[1])
        }
      }

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(storagePaths)

        if (storageError) {
          throw new Error(storageError.message)
        }
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      await loadProducts()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not remove product.',
      )
    } finally {
      setDeletingProductId(null)
    }
  }

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
  ) => {
    setUpdatingOrderId(orderId)
    setOrderError('')
    setOrderMessage('')

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      setOrderError(updateError.message)
      setUpdatingOrderId(null)
      return
    }

    setOrderMessage(
      status === 'confirmed'
        ? 'Order confirmed successfully.'
        : 'Order marked as delivered successfully.',
    )

    await loadOrders()
    setUpdatingOrderId(null)
  }

  const handleDeleteOrder = async (order: Order) => {
    const confirmed = window.confirm(
      `Remove order ${order.order_number}? This will also remove its order items.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingOrderId(order.id)
    setOrderError('')
    setOrderMessage('')

    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', order.id)

    if (deleteError) {
      setOrderError(deleteError.message)
      setDeletingOrderId(null)
      return
    }

    setOrderMessage(`Order ${order.order_number} removed successfully.`)

    await loadOrders()
    setDeletingOrderId(null)
  }

  const orderItemsByOrder = useMemo(() => {
    const map: Record<string, OrderItem[]> = {}

    for (const item of orderItems) {
      if (!map[item.order_id]) {
        map[item.order_id] = []
      }

      map[item.order_id].push(item)
    }

    return map
  }, [orderItems])

  const filteredOrders = useMemo(() => {
    if (orderTab === 'all') {
      return orders
    }

    return orders.filter((order) => order.status === orderTab)
  }, [orders, orderTab])

  const newOrdersCount = orders.filter(
    (order) => order.status === 'new',
  ).length

  const confirmedOrdersCount = orders.filter(
    (order) => order.status === 'confirmed',
  ).length

  const deliveredOrdersCount = orders.filter(
    (order) => order.status === 'delivered',
  ).length

  const activeProductsCount = products.filter(
    (product) => product.is_active,
  ).length

  const featuredProductsCount = products.filter(
    (product) => product.is_featured,
  ).length

  if (loading) {
    return (
      <div style={styles.fullScreen}>
        <div style={styles.loadingText}>Loading admin...</div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div style={styles.fullScreen}>
        <div style={styles.loginCard}>
          <img
            src={logo}
            alt="BELLnBUY"
            style={styles.loginLogo}
          />

          <h1 style={styles.loginTitle}>Admin Login</h1>

          <p style={styles.loginSubtitle}>
            Sign in to manage your BELLnBUY store.
          </p>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@email.com"
              style={styles.input}
              autoComplete="email"
            />

            <label style={styles.label}>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              style={styles.input}
              autoComplete="current-password"
            />

            <button
              type="submit"
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div>
          <img
            src={logo}
            alt="BELLnBUY"
            style={styles.sidebarLogo}
          />

          <div style={styles.sidebarBrand}>ADMIN PANEL</div>

          <nav style={styles.nav}>
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              style={
                activeSection === 'dashboard'
                  ? styles.navButtonActive
                  : styles.navButton
              }
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('products')}
              style={
                activeSection === 'products'
                  ? styles.navButtonActive
                  : styles.navButton
              }
            >
              Products
            </button>

            <button
              type="button"
              onClick={() => {
                setProductError('')
                setProductMessage('')
                setActiveSection('add-product')
              }}
              style={
                activeSection === 'add-product'
                  ? styles.navButtonActive
                  : styles.navButton
              }
            >
              Add Product
            </button>

            <button
              type="button"
              onClick={() => {
                setOrderError('')
                setOrderMessage('')
                setActiveSection('orders')
              }}
              style={
                activeSection === 'orders'
                  ? styles.navButtonActive
                  : styles.navButton
              }
            >
              <span>Orders</span>

              {newOrdersCount > 0 && (
                <span style={styles.navBadge}>
                  {newOrdersCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          LOG OUT
        </button>
      </aside>

      <main style={styles.main}>
        {activeSection === 'dashboard' && (
          <>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Dashboard</h1>
                <p style={styles.pageSubtitle}>
                  Manage your BELLnBUY store.
                </p>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>TOTAL PRODUCTS</span>
                <strong style={styles.statValue}>
                  {products.length}
                </strong>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statLabel}>ACTIVE PRODUCTS</span>
                <strong style={styles.statValue}>
                  {activeProductsCount}
                </strong>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statLabel}>FEATURED PRODUCTS</span>
                <strong style={styles.statValue}>
                  {featuredProductsCount}
                </strong>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statLabel}>NEW ORDERS</span>
                <strong style={styles.statValue}>
                  {newOrdersCount}
                </strong>
              </div>
            </div>

            <div style={styles.dashboardCard}>
              <h2 style={styles.cardTitle}>Order Overview</h2>

              <div style={styles.orderOverviewGrid}>
                <div>
                  <span style={styles.statLabel}>NEW</span>
                  <strong style={styles.overviewNumber}>
                    {newOrdersCount}
                  </strong>
                </div>

                <div>
                  <span style={styles.statLabel}>CONFIRMED</span>
                  <strong style={styles.overviewNumber}>
                    {confirmedOrdersCount}
                  </strong>
                </div>

                <div>
                  <span style={styles.statLabel}>DELIVERED</span>
                  <strong style={styles.overviewNumber}>
                    {deliveredOrdersCount}
                  </strong>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'products' && (
          <>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Products</h1>
                <p style={styles.pageSubtitle}>
                  View and manage all store products.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('add-product')}
                style={styles.primaryButtonSmall}
              >
                + ADD PRODUCT
              </button>
            </div>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <div style={styles.tableCard}>
              {productsLoading ? (
                <div style={styles.emptyState}>
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div style={styles.emptyState}>
                  No products found.
                </div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>PRODUCT</th>
                        <th style={styles.th}>CATEGORY</th>
                        <th style={styles.th}>PRICE</th>
                        <th style={styles.th}>STATUS</th>
                        <th style={styles.th}>DATE</th>
                        <th style={styles.th}>ACTION</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td style={styles.td}>
                            <strong>{product.name}</strong>
                          </td>

                          <td style={styles.td}>
                            {product.category || '—'}
                          </td>

                          <td style={styles.td}>
                            {formatPrice(product.price)}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={
                                product.is_active
                                  ? styles.activeBadge
                                  : styles.inactiveBadge
                              }
                            >
                              {product.is_active
                                ? 'ACTIVE'
                                : 'INACTIVE'}
                            </span>
                          </td>

                          <td style={styles.td}>
                            {formatDate(product.created_at)}
                          </td>

                          <td style={styles.td}>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteProduct(product)
                              }
                              disabled={
                                deletingProductId === product.id
                              }
                              style={styles.deleteButton}
                            >
                              {deletingProductId === product.id
                                ? 'REMOVING...'
                                : 'DELETE'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'add-product' && (
          <>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Add Product</h1>
                <p style={styles.pageSubtitle}>
                  Create a new BELLnBUY product.
                </p>
              </div>
            </div>

            {productError && (
              <div style={styles.errorBox}>
                {productError}
              </div>
            )}

            {productMessage && (
              <div style={styles.successBox}>
                {productMessage}
              </div>
            )}

            <form onSubmit={handleCreateProduct}>
              <div style={styles.formCard}>
                <h2 style={styles.cardTitle}>Basic Information</h2>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Product Name</label>

                    <input
                      value={productName}
                      onChange={(event) =>
                        setProductName(event.target.value)
                      }
                      placeholder="Premium Oversized Tee"
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Slug</label>

                    <input
                      value={productSlug}
                      onChange={(event) =>
                        setProductSlug(event.target.value)
                      }
                      placeholder="premium-oversized-tee"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fullWidth}>
                    <label style={styles.label}>Description</label>

                    <textarea
                      value={productDescription}
                      onChange={(event) =>
                        setProductDescription(event.target.value)
                      }
                      placeholder="Product description..."
                      style={styles.textarea}
                      rows={5}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Price</label>

                    <input
                      type="number"
                      min="0"
                      value={productPrice}
                      onChange={(event) =>
                        setProductPrice(event.target.value)
                      }
                      placeholder="1999"
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>
                      Compare At Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productComparePrice}
                      onChange={(event) =>
                        setProductComparePrice(event.target.value)
                      }
                      placeholder="2499"
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Category</label>

                    <input
                      value={productCategory}
                      onChange={(event) =>
                        setProductCategory(event.target.value)
                      }
                      placeholder="T-Shirts"
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Product Type</label>

                    <input
                      value={productType}
                      onChange={(event) =>
                        setProductType(event.target.value)
                      }
                      placeholder="Oversized Tee"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.checkboxRow}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(event) =>
                        setIsFeatured(event.target.checked)
                      }
                    />
                    Featured Product
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(event) =>
                        setIsNewArrival(event.target.checked)
                      }
                    />
                    New Arrival
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) =>
                        setIsActive(event.target.checked)
                      }
                    />
                    Active
                  </label>
                </div>
              </div>

              <div style={styles.formCard}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Variants</h2>
                    <p style={styles.cardDescription}>
                      Add available sizes, colors and stock.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    style={styles.secondaryButton}
                  >
                    + ADD VARIANT
                  </button>
                </div>

                <div style={styles.variantList}>
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      style={styles.variantRow}
                    >
                      <input
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'size',
                            event.target.value,
                          )
                        }
                        placeholder="Size e.g. M"
                        style={styles.input}
                      />

                      <input
                        value={variant.color}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'color',
                            event.target.value,
                          )
                        }
                        placeholder="Color e.g. Black"
                        style={styles.input}
                      />

                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'stock',
                            event.target.value,
                          )
                        }
                        placeholder="Stock"
                        style={styles.input}
                      />

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        style={styles.deleteButton}
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.formCard}>
                <h2 style={styles.cardTitle}>Product Images</h2>

                <p style={styles.cardDescription}>
                  First image will automatically become the primary
                  product image.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFiles}
                  style={styles.fileInput}
                />

                {imagePreviews.length > 0 && (
                  <div style={styles.previewGrid}>
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={preview}
                        style={styles.previewCard}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={styles.previewImage}
                        />

                        {index === 0 && (
                          <span style={styles.primaryImageBadge}>
                            PRIMARY
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.submitRow}>
                <button
                  type="submit"
                  disabled={productSaving}
                  style={styles.primaryButton}
                >
                  {productSaving
                    ? 'CREATING PRODUCT...'
                    : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </>
        )}

        {activeSection === 'orders' && (
          <>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Orders</h1>
                <p style={styles.pageSubtitle}>
                  Manage customer orders and update their delivery
                  status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadOrders()}
                disabled={ordersLoading}
                style={styles.secondaryButton}
              >
                {ordersLoading ? 'REFRESHING...' : 'REFRESH ORDERS'}
              </button>
            </div>

            {orderError && (
              <div style={styles.errorBox}>
                {orderError}
              </div>
            )}

            {orderMessage && (
              <div style={styles.successBox}>
                {orderMessage}
              </div>
            )}

            <div style={styles.orderTabs}>
              <button
                type="button"
                onClick={() => setOrderTab('new')}
                style={
                  orderTab === 'new'
                    ? styles.orderTabActive
                    : styles.orderTab
                }
              >
                New Orders
                <span style={styles.tabCount}>
                  {newOrdersCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderTab('confirmed')}
                style={
                  orderTab === 'confirmed'
                    ? styles.orderTabActive
                    : styles.orderTab
                }
              >
                Confirmed
                <span style={styles.tabCount}>
                  {confirmedOrdersCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderTab('delivered')}
                style={
                  orderTab === 'delivered'
                    ? styles.orderTabActive
                    : styles.orderTab
                }
              >
                Delivered
                <span style={styles.tabCount}>
                  {deliveredOrdersCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrderTab('all')}
                style={
                  orderTab === 'all'
                    ? styles.orderTabActive
                    : styles.orderTab
                }
              >
                All Orders
                <span style={styles.tabCount}>
                  {orders.length}
                </span>
              </button>
            </div>

            {ordersLoading ? (
              <div style={styles.tableCard}>
                <div style={styles.emptyState}>
                  Loading orders...
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={styles.tableCard}>
                <div style={styles.emptyState}>
                  No {orderTab === 'all' ? '' : orderTab} orders found.
                </div>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {filteredOrders.map((order) => {
                  const items =
                    orderItemsByOrder[order.id] ?? []

                  return (
                    <div
                      key={order.id}
                      style={styles.orderCard}
                    >
                      <div style={styles.orderHeader}>
                        <div>
                          <div style={styles.orderNumber}>
                            {order.order_number}
                          </div>

                          <div style={styles.orderDate}>
                            {formatDate(order.created_at)}
                          </div>
                        </div>

                        <span
                          style={
                            order.status === 'new'
                              ? styles.statusNew
                              : order.status === 'confirmed'
                                ? styles.statusConfirmed
                                : styles.statusDelivered
                          }
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={styles.orderInfoGrid}>
                        <div style={styles.infoSection}>
                          <h3 style={styles.infoTitle}>
                            CUSTOMER
                          </h3>

                          <div style={styles.infoLine}>
                            <strong>Name:</strong>{' '}
                            {order.customer_name}
                          </div>

                          <div style={styles.infoLine}>
                            <strong>Email:</strong>{' '}
                            {order.customer_email}
                          </div>

                          <div style={styles.infoLine}>
                            <strong>Phone:</strong>{' '}
                            {order.customer_phone}
                          </div>
                        </div>

                        <div style={styles.infoSection}>
                          <h3 style={styles.infoTitle}>
                            DELIVERY
                          </h3>

                          <div style={styles.infoLine}>
                            <strong>Address:</strong>{' '}
                            {order.delivery_address}
                          </div>

                          <div style={styles.infoLine}>
                            <strong>Area:</strong>{' '}
                            {order.delivery_area || '—'}
                          </div>

                          <div style={styles.infoLine}>
                            <strong>City:</strong>{' '}
                            {order.delivery_city}
                          </div>

                          <div style={styles.infoLine}>
                            <strong>Province:</strong>{' '}
                            {order.delivery_province || '—'}
                          </div>

                          <div style={styles.infoLine}>
                            <strong>Postal Code:</strong>{' '}
                            {order.delivery_postal_code || '—'}
                          </div>
                        </div>
                      </div>

                      <div style={styles.itemsSection}>
                        <h3 style={styles.infoTitle}>
                          ORDER ITEMS
                        </h3>

                        {items.length === 0 ? (
                          <div style={styles.mutedText}>
                            No order items found.
                          </div>
                        ) : (
                          <div style={styles.itemsTableWrap}>
                            <table style={styles.itemsTable}>
                              <thead>
                                <tr>
                                  <th style={styles.itemTh}>
                                    PRODUCT
                                  </th>
                                  <th style={styles.itemTh}>
                                    SIZE
                                  </th>
                                  <th style={styles.itemTh}>
                                    COLOR
                                  </th>
                                  <th style={styles.itemTh}>
                                    QTY
                                  </th>
                                  <th style={styles.itemTh}>
                                    PRICE
                                  </th>
                                  <th style={styles.itemTh}>
                                    TOTAL
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {items.map((item) => (
                                  <tr key={item.id}>
                                    <td style={styles.itemTd}>
                                      {item.product_name}
                                    </td>

                                    <td style={styles.itemTd}>
                                      {item.size || '—'}
                                    </td>

                                    <td style={styles.itemTd}>
                                      {item.color || '—'}
                                    </td>

                                    <td style={styles.itemTd}>
                                      {item.quantity}
                                    </td>

                                    <td style={styles.itemTd}>
                                      {formatPrice(
                                        Number(item.unit_price),
                                      )}
                                    </td>

                                    <td style={styles.itemTd}>
                                      {formatPrice(
                                        Number(item.total_price),
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div style={styles.orderBottom}>
                        <div style={styles.totals}>
                          <div style={styles.totalLine}>
                            <span>Subtotal</span>
                            <strong>
                              {formatPrice(
                                Number(order.subtotal),
                              )}
                            </strong>
                          </div>

                          <div style={styles.totalLine}>
                            <span>Delivery Fee</span>
                            <strong>
                              {formatPrice(
                                Number(order.delivery_fee),
                              )}
                            </strong>
                          </div>

                          <div style={styles.grandTotalLine}>
                            <span>Total</span>
                            <strong>
                              {formatPrice(
                                Number(order.total_amount),
                              )}
                            </strong>
                          </div>
                        </div>

                        <div style={styles.orderActions}>
                          {order.status === 'new' && (
                            <button
                              type="button"
                              onClick={() =>
                                void updateOrderStatus(
                                  order.id,
                                  'confirmed',
                                )
                              }
                              disabled={
                                updatingOrderId === order.id
                              }
                              style={styles.confirmButton}
                            >
                              {updatingOrderId === order.id
                                ? 'UPDATING...'
                                : 'CONFIRM ORDER'}
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() =>
                                void updateOrderStatus(
                                  order.id,
                                  'delivered',
                                )
                              }
                              disabled={
                                updatingOrderId === order.id
                              }
                              style={styles.deliveredButton}
                            >
                              {updatingOrderId === order.id
                                ? 'UPDATING...'
                                : 'MARK DELIVERED'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteOrder(order)
                            }
                            disabled={
                              deletingOrderId === order.id
                            }
                            style={styles.deleteOrderButton}
                          >
                            {deletingOrderId === order.id
                              ? 'REMOVING...'
                              : 'REMOVE ORDER'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  fullScreen: {
    minHeight: '100vh',
    background: '#f5f7fa',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },

  loadingText: {
    color: '#6b7280',
    fontSize: '15px',
  },

  loginCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    padding: '38px',
    boxSizing: 'border-box',
    boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
  },

  loginLogo: {
    width: '170px',
    maxWidth: '100%',
    display: 'block',
    margin: '0 auto 28px',
  },

  loginTitle: {
    margin: 0,
    fontSize: '30px',
    fontWeight: 700,
    textAlign: 'center',
    color: '#111827',
  },

  loginSubtitle: {
    color: '#6b7280',
    fontSize: '14px',
    textAlign: 'center',
    margin: '10px 0 28px',
  },

  app: {
    minHeight: '100vh',
    background: '#f5f7fa',
    color: '#111827',
    display: 'flex',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: '28px 18px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
  },

  sidebarLogo: {
    width: '155px',
    maxWidth: '100%',
    display: 'block',
    margin: '0 auto 12px',
  },

  sidebarBrand: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '28px',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  navButton: {
    width: '100%',
    border: '1px solid transparent',
    background: 'transparent',
    color: '#6b7280',
    padding: '13px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navButtonActive: {
    width: '100%',
    border: '1px solid #00bfff',
    background: '#effaff',
    color: '#111827',
    padding: '13px 14px',
    borderRadius: '9px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navBadge: {
    minWidth: '21px',
    height: '21px',
    borderRadius: '50%',
    background: '#00bfff',
    color: '#001018',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 800,
  },

  logoutButton: {
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#6b7280',
    padding: '12px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
  },

  main: {
    flex: 1,
    minWidth: 0,
    padding: '36px',
    boxSizing: 'border-box',
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },

  pageTitle: {
    margin: 0,
    fontSize: '32px',
    lineHeight: 1.15,
    fontWeight: 750,
    color: '#111827',
  },

  pageSubtitle: {
    margin: '8px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  statCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 3px 12px rgba(15, 23, 42, 0.04)',
  },

  statLabel: {
    display: 'block',
    color: '#6b7280',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    marginBottom: '10px',
  },

  statValue: {
    fontSize: '30px',
    lineHeight: 1,
    color: '#111827',
  },

  dashboardCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 3px 12px rgba(15, 23, 42, 0.04)',
  },

  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
  },

  cardDescription: {
    color: '#6b7280',
    fontSize: '13px',
    margin: '7px 0 0',
  },

  orderOverviewGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '24px',
    marginTop: '24px',
  },

  overviewNumber: {
    display: 'block',
    fontSize: '26px',
    marginTop: '4px',
    color: '#111827',
  },

  primaryButton: {
    width: '100%',
    border: '1px solid #00bfff',
    background: '#00bfff',
    color: '#001018',
    padding: '14px 18px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.8px',
  },

  primaryButtonSmall: {
    border: '1px solid #00bfff',
    background: '#00bfff',
    color: '#001018',
    padding: '12px 17px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 800,
  },

  secondaryButton: {
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#374151',
    padding: '11px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
  },

  errorBox: {
    background: '#fff5f5',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '9px',
    padding: '13px 15px',
    marginBottom: '18px',
    fontSize: '13px',
  },

  successBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    borderRadius: '9px',
    padding: '13px 15px',
    marginBottom: '18px',
    fontSize: '13px',
  },

  tableCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 3px 12px rgba(15, 23, 42, 0.04)',
  },

  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '850px',
  },

  th: {
    textAlign: 'left',
    color: '#6b7280',
    fontSize: '10px',
    letterSpacing: '1px',
    padding: '15px 18px',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
    background: '#f9fafb',
  },

  td: {
    padding: '17px 18px',
    borderBottom: '1px solid #f0f0f0',
    color: '#4b5563',
    fontSize: '13px',
    verticalAlign: 'middle',
  },

  activeBadge: {
    display: 'inline-block',
    padding: '5px 8px',
    borderRadius: '999px',
    background: '#ecfdf3',
    color: '#15803d',
    fontSize: '9px',
    fontWeight: 800,
  },

  inactiveBadge: {
    display: 'inline-block',
    padding: '5px 8px',
    borderRadius: '999px',
    background: '#f3f4f6',
    color: '#6b7280',
    fontSize: '9px',
    fontWeight: 800,
  },

  deleteButton: {
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: '#dc2626',
    padding: '8px 10px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  emptyState: {
    padding: '60px 24px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },

  formCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '18px',
    boxShadow: '0 3px 12px rgba(15, 23, 42, 0.04)',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '18px',
    marginTop: '22px',
  },

  fullWidth: {
    gridColumn: '1 / -1',
  },

  label: {
    display: 'block',
    color: '#374151',
    fontSize: '11px',
    fontWeight: 700,
    marginBottom: '8px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    borderRadius: '8px',
    padding: '12px 13px',
    outline: 'none',
    fontSize: '13px',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    borderRadius: '8px',
    padding: '12px 13px',
    outline: 'none',
    fontSize: '13px',
    resize: 'vertical',
  },

  checkboxRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '22px',
    marginTop: '22px',
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4b5563',
    fontSize: '12px',
    cursor: 'pointer',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },

  variantList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },

  variantRow: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr)) auto',
    gap: '10px',
    alignItems: 'center',
  },

  fileInput: {
    marginTop: '20px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px dashed #cbd5e1',
    background: '#f9fafb',
    color: '#6b7280',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '12px',
  },

  previewGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    marginTop: '20px',
  },

  previewCard: {
    position: 'relative',
    border: '1px solid #e5e7eb',
    borderRadius: '9px',
    overflow: 'hidden',
    aspectRatio: '1 / 1',
    background: '#f3f4f6',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  primaryImageBadge: {
    position: 'absolute',
    left: '8px',
    bottom: '8px',
    background: '#00bfff',
    color: '#001018',
    padding: '5px 7px',
    borderRadius: '5px',
    fontSize: '8px',
    fontWeight: 900,
  },

  submitRow: {
    maxWidth: '300px',
    marginTop: '4px',
  },

  orderTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },

  orderTab: {
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#6b7280',
    padding: '11px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
  },

  orderTabActive: {
    border: '1px solid #00bfff',
    background: '#effaff',
    color: '#111827',
    padding: '11px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
  },

  tabCount: {
    minWidth: '19px',
    height: '19px',
    borderRadius: '50%',
    background: '#eef2f7',
    color: '#374151',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
  },

  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  orderCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 3px 12px rgba(15, 23, 42, 0.04)',
  },

  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    padding: '20px 22px',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    background: '#ffffff',
  },

  orderNumber: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '0.3px',
    color: '#111827',
  },

  orderDate: {
    color: '#9ca3af',
    fontSize: '11px',
    marginTop: '6px',
  },

  statusNew: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#a16207',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '9px',
    fontWeight: 900,
  },

  statusConfirmed: {
    background: '#effaff',
    border: '1px solid #bae6fd',
    color: '#0369a1',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '9px',
    fontWeight: 900,
  },

  statusDelivered: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '9px',
    fontWeight: 900,
  },

  orderInfoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    padding: '22px',
  },

  infoSection: {
    minWidth: 0,
  },

  infoTitle: {
    margin: '0 0 13px',
    color: '#6b7280',
    fontSize: '10px',
    letterSpacing: '1.2px',
    fontWeight: 800,
  },

  infoLine: {
    color: '#4b5563',
    fontSize: '13px',
    lineHeight: 1.65,
    overflowWrap: 'anywhere',
  },

  itemsSection: {
    padding: '0 22px 22px',
  },

  itemsTableWrap: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '9px',
  },

  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '650px',
  },

  itemTh: {
    textAlign: 'left',
    color: '#6b7280',
    fontSize: '9px',
    letterSpacing: '1px',
    padding: '11px 13px',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
    background: '#f9fafb',
  },

  itemTd: {
    color: '#4b5563',
    fontSize: '12px',
    padding: '12px 13px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'top',
  },

  mutedText: {
    color: '#9ca3af',
    fontSize: '12px',
  },

  orderBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '24px',
    padding: '20px 22px',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    background: '#fafafa',
  },

  totals: {
    minWidth: '240px',
    marginLeft: 'auto',
  },

  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '25px',
    color: '#6b7280',
    fontSize: '12px',
    padding: '5px 0',
  },

  grandTotalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '25px',
    color: '#111827',
    fontSize: '16px',
    fontWeight: 800,
    paddingTop: '12px',
    marginTop: '7px',
    borderTop: '1px solid #d1d5db',
  },

  orderActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '9px',
  },

  confirmButton: {
    border: '1px solid #00bfff',
    background: '#00bfff',
    color: '#001018',
    padding: '11px 13px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 900,
  },

  deliveredButton: {
    border: '1px solid #22c55e',
    background: '#f0fdf4',
    color: '#15803d',
    padding: '11px 13px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 900,
  },

  deleteOrderButton: {
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: '#dc2626',
    padding: '11px 13px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 900,
  },
}


export default Admin