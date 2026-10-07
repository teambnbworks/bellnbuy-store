import { useEffect, useMemo, useState } from 'react'
import type {
  CSSProperties,
  FormEvent,
} from 'react'
import logo from './assets/BNB-10-10.png'
import './App.css'
import Admin from './Admin'
import { supabase } from './supabase'

type Product = {
  id: string
  name: string
  material: string
  price: number
  status: string
  category: string
  isNewArrival: boolean
  isFeatured: boolean
  description?: string
  slug?: string
  published?: boolean
  comparePrice?: number | null
  images: string[]
  sizes: string[]
  colors: string[]
}

type CartItem = {
  id: string
  name: string
  material: string
  price: number
  size: string
  color: string
  quantity: number
}

type DbProduct = {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  material?: string | null
  price?: number | null
  compare_at_price?: number | null
  category?: string | null
  product_type?: string | null
  is_featured?: boolean | null
  is_new_arrival?: boolean | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

type DbProductImage = {
  id: string
  product_id: string
  image_url: string
  alt_text?: string | null
  sort_order?: number | null
  is_primary?: boolean | null
}

type DbProductVariant = {
  id: string
  product_id: string
  size?: string | null
  color?: string | null
  stock?: number | null
}

const fallbackProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Oversized Essential Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 0,
    status: 'COMING SOON',
    category: 'ESSENTIALS',
    isNewArrival: true,
    isFeatured: true,
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
  {
    id: 'demo-2',
    name: 'Signature Oversized Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 0,
    status: 'COMING SOON',
    category: 'SIGNATURE',
    isNewArrival: true,
    isFeatured: true,
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
  {
    id: 'demo-3',
    name: 'Minimal Everyday Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 0,
    status: 'COMING SOON',
    category: 'ESSENTIALS',
    isNewArrival: true,
    isFeatured: true,
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
  {
    id: 'demo-4',
    name: 'Classic Drop Shoulder Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 0,
    status: 'COMING SOON',
    category: 'DROP SHOULDER',
    isNewArrival: false,
    isFeatured: false,
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
  {
    id: 'demo-5',
    name: 'Urban Essential Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 0,
    status: 'COMING SOON',
    category: 'ESSENTIALS',
    isNewArrival: false,
    isFeatured: false,
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
  {
    id: 'demo-6',
    name: 'Premium Daily Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 0,
    status: 'COMING SOON',
    category: 'SIGNATURE',
    isNewArrival: false,
    isFeatured: false,
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
]

function formatPrice(price: number) {
  if (!price || price <= 0) {
    return 'Rs. —'
  }

  return `Rs. ${price.toLocaleString('en-PK')}`
}

function App() {
  if (window.location.pathname === '/admin') {
    return <Admin />
  }

  return <Storefront />
}

function Storefront() {
  const [products, setProducts] = useState<Product[]>(
    fallbackProducts,
  )

  const [productsLoading, setProductsLoading] =
    useState(true)

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const [activeFilter, setActiveFilter] =
    useState('ALL')

  const [searchQuery, setSearchQuery] =
    useState('')

  const [currentPage, setCurrentPage] =
    useState(1)

  const [reviewName, setReviewName] =
    useState('')

  const [reviewText, setReviewText] =
    useState('')

  const [reviewRating, setReviewRating] =
    useState(5)

  const [reviewSubmitted, setReviewSubmitted] =
    useState(false)

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false)

  const [contactName, setContactName] =
    useState('')

  const [contactEmail, setContactEmail] =
    useState('')

  const [contactMessage, setContactMessage] =
    useState('')

  const [contactSubmitted, setContactSubmitted] =
    useState(false)

  const [contactSubmitting, setContactSubmitting] =
    useState(false)

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null)

  const [selectedSize, setSelectedSize] =
    useState('')

  const [selectedColor, setSelectedColor] =
    useState('')

  const [quantity, setQuantity] =
    useState(1)

  const [selectedImage, setSelectedImage] =
    useState('')

  const [cartItems, setCartItems] =
    useState<CartItem[]>([])

  const [cartMessage, setCartMessage] =
    useState('')

  const [checkoutOpen, setCheckoutOpen] =
    useState(false)

  const [customerName, setCustomerName] =
    useState('')

  const [customerEmail, setCustomerEmail] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')

  const [customerArea, setCustomerArea] =
    useState('')

  const [customerAddress, setCustomerAddress] =
    useState('')

  const [customerCity, setCustomerCity] =
    useState('Karachi')

  const [customerProvince, setCustomerProvince] =
    useState('Sindh')

  const [customerPostalCode, setCustomerPostalCode] =
    useState('')

  const [deliveryConfirmed, setDeliveryConfirmed] =
    useState(false)

  const [orderPlaced, setOrderPlaced] =
    useState(false)

  const [orderNumber, setOrderNumber] =
    useState('')

  const [orderSubmitting, setOrderSubmitting] =
    useState(false)

  const [orderError, setOrderError] =
    useState('')

  /*
   * LOAD CART
   */
  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem('bellnbuy-cart')

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart)
        }
      }
    } catch {
      localStorage.removeItem('bellnbuy-cart')
    }
  }, [])

  /*
   * SAVE CART
   */
  useEffect(() => {
    localStorage.setItem(
      'bellnbuy-cart',
      JSON.stringify(cartItems),
    )
  }, [cartItems])

  /*
   * LOAD PRODUCTS FROM SUPABASE
   */
  useEffect(() => {
    let mounted = true

    const loadProducts = async () => {
      setProductsLoading(true)

      try {
        const {
          data,
          error,
        } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', {
            ascending: false,
          })

        if (!mounted) {
          return
        }

        if (error) {
          console.error(
            'Products loading error:',
            error,
          )

          setProducts(fallbackProducts)
          setProductsLoading(false)
          return
        }

        if (!data || data.length === 0) {
          setProducts(fallbackProducts)
          setProductsLoading(false)
          return
        }

        const dbProducts =
          data as DbProduct[]

        const productIds =
          dbProducts.map(
            (product) =>
              product.id,
          )

        let imageData: DbProductImage[] =
          []

        let variantData: DbProductVariant[] =
          []

        if (productIds.length > 0) {
          const [
            imagesResult,
            variantsResult,
          ] = await Promise.all([
            supabase
              .from('product_images')
              .select(
                'id, product_id, image_url, alt_text, sort_order, is_primary',
              )
              .in(
                'product_id',
                productIds,
              )
              .order(
                'sort_order',
                {
                  ascending: true,
                },
              ),

            supabase
              .from('product_variants')
              .select(
                'id, product_id, size, color, stock',
              )
              .in(
                'product_id',
                productIds,
              ),
          ])

          if (imagesResult.error) {
            console.error(
              'Product images loading error:',
              imagesResult.error,
            )
          } else {
            imageData =
              (imagesResult.data ||
                []) as DbProductImage[]
          }

          if (variantsResult.error) {
            console.error(
              'Product variants loading error:',
              variantsResult.error,
            )
          } else {
            variantData =
              (variantsResult.data ||
                []) as DbProductVariant[]
          }
        }

        const mappedProducts: Product[] =
          dbProducts.map(
            (product) => {
              const productImages =
                imageData
                  .filter(
                    (image) =>
                      image.product_id ===
                      product.id,
                  )
                  .sort(
                    (
                      first,
                      second,
                    ) => {
                      const firstOrder =
                        first.sort_order ??
                        0

                      const secondOrder =
                        second.sort_order ??
                        0

                      return (
                        firstOrder -
                        secondOrder
                      )
                    },
                  )

              const productVariants =
                variantData.filter(
                  (variant) =>
                    variant.product_id ===
                    product.id,
                )

              const sizes = Array.from(
                new Set(
                  productVariants
                    .map(
                      (
                        variant,
                      ) =>
                        variant.size?.trim() ||
                        '',
                    )
                    .filter(
                      Boolean,
                    ),
                ),
              )

              const colors = Array.from(
                new Set(
                  productVariants
                    .map(
                      (
                        variant,
                      ) =>
                        variant.color?.trim() ||
                        '',
                    )
                    .filter(
                      Boolean,
                    ),
                ),
              )

              return {
                id: product.id,

                name:
                  product.name,

                material:
                  product.material ||
                  'Premium Cotton · 240 GSM',

                price:
                  Number(
                    product.price ||
                      0,
                  ),

                status:
                  product.is_active
                    ? 'AVAILABLE'
                    : 'COMING SOON',

                category:
                  product.category ||
                  'ESSENTIALS',

                isNewArrival:
                  Boolean(
                    product.is_new_arrival,
                  ),

                isFeatured:
                  Boolean(
                    product.is_featured,
                  ),

                description:
                  product.description ||
                  undefined,

                slug:
                  product.slug ||
                  undefined,

                published:
                  Boolean(
                    product.is_active,
                  ),

                comparePrice:
                  product.compare_at_price !=
                  null
                    ? Number(
                        product.compare_at_price,
                      )
                    : null,

                images:
                  productImages.map(
                    (image) =>
                      image.image_url,
                  ),

                sizes:
                  sizes.length > 0
                    ? sizes
                    : [
                        'S',
                        'M',
                        'L',
                        'XL',
                      ],

                colors:
                  colors.length > 0
                    ? colors
                    : [
                        'Black',
                        'White',
                      ],
              }
            },
          )

        if (mounted) {
          setProducts(
            mappedProducts,
          )
          setProductsLoading(false)
        }
      } catch (error) {
        console.error(
          'Unexpected product loading error:',
          error,
        )

        if (mounted) {
          setProducts(
            fallbackProducts,
          )
          setProductsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * CURSOR EFFECT
   */
  useEffect(() => {
    const handleMouseMove = (
      event: MouseEvent,
    ) => {
      document.documentElement.style.setProperty(
        '--cursor-x',
        event.clientX + 'px',
      )

      document.documentElement.style.setProperty(
        '--cursor-y',
        event.clientY + 'px',
      )
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove,
    )

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove,
      )
    }
  }, [])

  /*
   * FILTER + SEARCH
   */
  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchQuery
        .trim()
        .toLowerCase()

    return products.filter(
      (product) => {
        const matchesFilter =
          activeFilter === 'ALL' ||
          product.category ===
            activeFilter

        const matchesSearch =
          !normalizedSearch ||
          product.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          product.material
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          product.category
            .toLowerCase()
            .includes(
              normalizedSearch,
            )

        return (
          matchesFilter &&
          matchesSearch
        )
      },
    )
  }, [
    products,
    activeFilter,
    searchQuery,
  ])

  /*
   * PAGINATION
   */
  const productsPerPage = 6

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage,
    ),
  )

  const paginatedProducts =
    filteredProducts.slice(
      (currentPage - 1) *
        productsPerPage,
      currentPage *
        productsPerPage,
    )

  /*
   * FEATURED / NEW
   */
  const featuredProducts =
    products
      .filter(
        (product) =>
          product.isFeatured,
      )
      .slice(0, 3)

  const newArrivals =
    products
      .filter(
        (product) =>
          product.isNewArrival,
      )
      .slice(0, 3)

  /*
   * CART TOTALS
   */
  const cartItemCount =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    )

  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0,
    )

  const deliveryFee =
    cartItems.length > 0
      ? 199
      : 0

  const grandTotal =
    subtotal + deliveryFee

  /*
   * MOBILE MENU
   */
  const closeMobileMenu =
    () => {
      setMobileMenuOpen(
        false,
      )
    }

  /*
   * PRODUCT
   */
  const openProduct = (
    product: Product,
  ) => {
    setSelectedProduct(product)
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setCartMessage('')
    setSelectedImage(
      product.images[0] || '',
    )

    window.setTimeout(() => {
      document
        .getElementById(
          'product',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  const closeProduct = () => {
    setSelectedProduct(null)
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setSelectedImage('')
    setCartMessage('')
  }

  /*
   * QUANTITY
   */
  const increaseQuantity =
    () => {
      setQuantity(
        (current) =>
          current + 1,
      )
    }

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) => {
          if (current <= 1) {
            return 1
          }

          return current - 1
        },
      )
    }

  /*
   * ADD TO CART
   */
  const addToCart = () => {
    if (!selectedProduct) {
      return
    }

    if (
      selectedProduct.price <=
      0
    ) {
      setCartMessage(
        'This product is not available for ordering yet.',
      )
      return
    }

    if (
      !selectedSize ||
      !selectedColor
    ) {
      setCartMessage(
        'Please select a size and color first.',
      )
      return
    }

    const existingItem =
      cartItems.find(
        (item) =>
          item.id ===
            selectedProduct.id &&
          item.size ===
            selectedSize &&
          item.color ===
            selectedColor,
      )

    if (existingItem) {
      setCartItems(
        (currentItems) =>
          currentItems.map(
            (item) => {
              if (
                item.id ===
                  selectedProduct.id &&
                item.size ===
                  selectedSize &&
                item.color ===
                  selectedColor
              ) {
                return {
                  ...item,
                  quantity:
                    item.quantity +
                    quantity,
                }
              }

              return item
            },
          ),
      )
    } else {
      const newItem: CartItem =
        {
          id:
            selectedProduct.id,
          name:
            selectedProduct.name,
          material:
            selectedProduct.material,
          price:
            selectedProduct.price,
          size:
            selectedSize,
          color:
            selectedColor,
          quantity,
        }

      setCartItems(
        (currentItems) => [
          ...currentItems,
          newItem,
        ],
      )
    }

    setCartMessage(
      'Added to cart successfully.',
    )
  }

  /*
   * CART QUANTITY
   */
  const increaseCartQuantity =
    (
      itemId: string,
      size: string,
      color: string,
    ) => {
      setCartItems(
        (currentItems) =>
          currentItems.map(
            (item) => {
              if (
                item.id ===
                  itemId &&
                item.size ===
                  size &&
                item.color ===
                  color
              ) {
                return {
                  ...item,
                  quantity:
                    item.quantity +
                    1,
                }
              }

              return item
            },
          ),
      )
    }

  const decreaseCartQuantity =
    (
      itemId: string,
      size: string,
      color: string,
    ) => {
      setCartItems(
        (currentItems) =>
          currentItems
            .map(
              (item) => {
                if (
                  item.id ===
                    itemId &&
                  item.size ===
                    size &&
                  item.color ===
                    color
                ) {
                  return {
                    ...item,
                    quantity:
                      item.quantity -
                      1,
                  }
                }

                return item
              },
            )
            .filter(
              (item) =>
                item.quantity >
                0,
            ),
      )
    }

  const removeFromCart =
    (
      itemId: string,
      size: string,
      color: string,
    ) => {
      setCartItems(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              !(
                item.id ===
                  itemId &&
                item.size ===
                  size &&
                item.color ===
                  color
              ),
          ),
      )
    }

  /*
   * CHECKOUT
   */
  const openCheckout = () => {
    if (
      cartItems.length ===
      0
    ) {
      return
    }

    setCheckoutOpen(true)
    setOrderPlaced(false)
    setOrderError('')
    setDeliveryConfirmed(
      false,
    )

    window.setTimeout(() => {
      document
        .getElementById(
          'checkout',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    setOrderPlaced(false)
    setOrderError('')
  }

  /*
   * PLACE REAL SUPABASE ORDER
   */
  const placeOrder = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      cartItems.length ===
      0
    ) {
      setOrderError(
        'Your cart is empty.',
      )
      return
    }

    if (!deliveryConfirmed) {
      setOrderError(
        'Please confirm the minimum delivery charges before placing your order.',
      )
      return
    }

    setOrderSubmitting(true)
    setOrderError('')

    const generatedOrderNumber =
      'BNB-' +
      String(Date.now()).slice(
        -8,
      )

    try {
      const {
        data: order,
        error: orderError,
      } = await supabase
        .from('orders')
        .insert({
          order_number:
            generatedOrderNumber,

          customer_name:
            customerName.trim(),

          customer_email:
            customerEmail.trim(),

          customer_phone:
            customerPhone.trim(),

          delivery_address:
            customerAddress.trim(),

          delivery_area:
            customerArea.trim() ||
            null,

          delivery_city:
            customerCity,

          delivery_province:
            customerProvince,

          delivery_postal_code:
            customerPostalCode.trim() ||
            null,

          subtotal:
            subtotal,

          delivery_fee:
            deliveryFee,

          total_amount:
            grandTotal,

          status: 'new',
        })
        .select('id')
        .single()

      if (
        orderError ||
        !order
      ) {
        throw (
          orderError ||
          new Error(
            'Unable to create order.',
          )
        )
      }

      const orderItems =
        cartItems.map(
          (item) => ({
            order_id:
              order.id,

            product_id:
              item.id.startsWith(
                'demo-',
              )
                ? null
                : item.id,

            product_name:
              item.name,

            size:
              item.size,

            color:
              item.color,

            quantity:
              item.quantity,

            unit_price:
              item.price,

            total_price:
              item.price *
              item.quantity,
          }),
        )

      const {
        error: itemsError,
      } = await supabase
        .from('order_items')
        .insert(
          orderItems,
        )

      if (itemsError) {
        await supabase
          .from('orders')
          .delete()
          .eq(
            'id',
            order.id,
          )

        throw itemsError
      }

      setOrderNumber(
        generatedOrderNumber,
      )

      setOrderPlaced(true)
      setCartItems([])
    } catch (error) {
      console.error(
        'Order error:',
        error,
      )

      setOrderError(
        'We could not place your order right now. Please try again.',
      )
    } finally {
      setOrderSubmitting(false)
    }
  }

  /*
   * REVIEW
   */
  const submitReview = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setReviewSubmitting(true)

    const { error } =
      await supabase
        .from('reviews')
        .insert({
          name: reviewName,
          rating: reviewRating,
          review: reviewText,
          status: 'pending',
        })

    setReviewSubmitting(false)

    if (error) {
      console.error(
        'Review error:',
        error,
      )

      setReviewSubmitted(false)
      return
    }

    setReviewSubmitted(true)
    setReviewName('')
    setReviewText('')
    setReviewRating(5)
  }

  /*
   * CONTACT
   */
  const submitContact = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setContactSubmitting(true)

    const { error } =
      await supabase
        .from('contact_messages')
        .insert({
          name: contactName,
          email: contactEmail,
          message:
            contactMessage,
          status: 'new',
        })

    setContactSubmitting(false)

    if (error) {
      console.error(
        'Contact error:',
        error,
      )

      setContactSubmitted(false)
      return
    }

    setContactSubmitted(true)
    setContactName('')
    setContactEmail('')
    setContactMessage('')
  }

  /*
   * FILTER
   */
  const handleFilterChange = (
    filter: string,
  ) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleSearchChange = (
    value: string,
  ) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  /*
   * PRODUCT IMAGE STYLE
   */
  const getProductImageStyle = (
    imageUrl?: string,
  ): CSSProperties => {
    if (!imageUrl) {
      return {}
    }

    return {
      backgroundImage: `url("${imageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition:
        'center',
      backgroundRepeat:
        'no-repeat',
    }
  }

  return (
    <main>
      <div
        className="cursor-glow"
        aria-hidden="true"
      />

      <div className="announcement-bar">
        Pakistan · Premium Oversized Tees · Crafted for Everyday Luxury
      </div>

      <header>
        <a
          href="/"
          aria-label="BELLnBUY home"
          onClick={
            closeMobileMenu
          }
        >
          <img
            src={logo}
            alt="BELLnBUY"
            width="200"
          />
        </a>

        <nav aria-label="Main navigation">
          <a href="#shop">
            Shop
          </a>

          <a href="#new-arrivals">
            New Arrivals
          </a>

          <a href="#about">
            About
          </a>

          <a href="#contact">
            Contact
          </a>

          <a href="#cart">
            Cart
            {cartItemCount > 0
              ? ` (${cartItemCount})`
              : ''}
          </a>
        </nav>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={
            mobileMenuOpen
          }
          onClick={() =>
            setMobileMenuOpen(
              true,
            )
          }
        >
          <span className="mobile-menu-icon">
            <span />
          </span>
        </button>
      </header>

      <div
        className={
          mobileMenuOpen
            ? 'mobile-menu-overlay active'
            : 'mobile-menu-overlay'
        }
        onClick={
          closeMobileMenu
        }
      />

      <aside
        className={
          mobileMenuOpen
            ? 'mobile-menu active'
            : 'mobile-menu'
        }
        aria-hidden={
          !mobileMenuOpen
        }
      >
        <button
          className="mobile-menu-close"
          type="button"
          aria-label="Close menu"
          onClick={
            closeMobileMenu
          }
        >
          ×
        </button>

        <nav aria-label="Mobile navigation">
          <a
            href="#shop"
            onClick={
              closeMobileMenu
            }
          >
            Shop
          </a>

          <a
            href="#new-arrivals"
            onClick={
              closeMobileMenu
            }
          >
            New Arrivals
          </a>

          <a
            href="#about"
            onClick={
              closeMobileMenu
            }
          >
            About
          </a>

          <a
            href="#contact"
            onClick={
              closeMobileMenu
            }
          >
            Contact
          </a>

          <a
            href="#cart"
            onClick={
              closeMobileMenu
            }
          >
            Cart
            {cartItemCount > 0
              ? ` (${cartItemCount})`
              : ''}
          </a>
        </nav>
      </aside>

      <section className="hero-section">
        <div className="hero-content fade-up">
          <p className="hero-eyebrow">
            BELLnBUY — NEW SEASON
          </p>

          <h1>
            Minimal.
            <br />
            Oversized.
            <br />
            Essential.
          </h1>

          <p className="hero-description">
            Premium oversized tees
            crafted for everyday
            luxury. Designed with a
            minimal approach and made
            for everyday wear.
          </p>

          <a
            href="#shop"
            className="hero-button"
          >
            Shop the Latest Drop
          </a>
        </div>
      </section>

      <section id="shop">
        <div className="section-heading">
          <p className="section-eyebrow">
            THE COLLECTION
          </p>

          <h2>
            Shop BELLnBUY
          </h2>

          <p>
            Premium oversized tees
            designed with a minimal
            approach and made for
            everyday luxury.
          </p>
        </div>

        <div className="shop-toolbar">
          <div className="shop-search">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(
                event,
              ) =>
                handleSearchChange(
                  event.target
                    .value,
                )
              }
              aria-label="Search products"
            />
          </div>

          <div className="shop-filters">
            {[
              ['ALL', 'All'],
              [
                'ESSENTIALS',
                'Essentials',
              ],
              [
                'SIGNATURE',
                'Signature',
              ],
              [
                'DROP SHOULDER',
                'Drop Shoulder',
              ],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    activeFilter ===
                    value
                      ? 'filter-button active'
                      : 'filter-button'
                  }
                  onClick={() =>
                    handleFilterChange(
                      value,
                    )
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>

          <div className="shop-toolbar-count">
            {productsLoading
              ? 'Loading...'
              : `${filteredProducts.length} Products`}
          </div>
        </div>

        {paginatedProducts.length >
        0 ? (
          <div className="product-grid">
            {paginatedProducts.map(
              (product) => (
                <article
                  className="product-card"
                  key={
                    product.id
                  }
                >
                  <button
                    type="button"
                    className="product-link"
                    onClick={() =>
                      openProduct(
                        product,
                      )
                    }
                    aria-label="View product"
                  >
                    <div
                      className="product-image"
                      style={getProductImageStyle(
                        product.images[0],
                      )}
                    >
                      {!product.images[0] && (
                        <span>
                          {product.status}
                        </span>
                      )}
                    </div>

                    <div className="product-info">
                      <div>
                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <p>
                          {
                            product.material
                          }
                        </p>
                      </div>

                      <strong>
                        {formatPrice(
                          product.price,
                        )}
                      </strong>
                    </div>
                  </button>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="empty-state shop-empty-state">
            <h2>
              No products found
            </h2>

            <p>
              We could not find a
              product matching your
              current search or
              filter.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setSearchQuery('')
                setActiveFilter(
                  'ALL',
                )
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        <div
          className="pagination"
          aria-label="Product pagination"
        >
          {Array.from(
            {
              length:
                totalPages,
            },
            (_, index) =>
              index + 1,
          ).map((page) => (
            <button
              key={page}
              className={
                currentPage ===
                page
                  ? 'pagination-number active'
                  : 'pagination-number'
              }
              type="button"
              onClick={() =>
                setCurrentPage(
                  page,
                )
              }
              aria-label={
                'Product page ' +
                page
              }
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-next"
            type="button"
            disabled={
              currentPage >=
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (current) =>
                  Math.min(
                    current + 1,
                    totalPages,
                  ),
              )
            }
          >
            Next →
          </button>
        </div>

        <p className="pagination-note">
          Products and pages
          will appear
          automatically as the
          BELLnBUY collection
          grows.
        </p>
      </section>

      <section id="new-arrivals">
        <div className="section-heading">
          <p className="section-eyebrow">
            LATEST DROP
          </p>

          <h2>
            New Arrivals
          </h2>

          <p>
            Discover the latest
            pieces from the
            BELLnBUY collection.
            New products will
            appear here
            automatically when
            published.
          </p>
        </div>

        <div className="product-grid">
          {newArrivals.map(
            (product) => (
              <article
                className="product-card"
                key={
                  product.id
                }
              >
                <button
                  type="button"
                  className="product-link"
                  onClick={() =>
                    openProduct(
                      product,
                    )
                  }
                  aria-label="View new arrival"
                >
                  <div
                    className="product-image"
                    style={getProductImageStyle(
                      product
                        .images[0],
                    )}
                  >
                    <small className="product-badge">
                      NEW ARRIVAL
                    </small>

                    {!product
                      .images[0] && (
                      <span>
                        {
                          product.status
                        }
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <div>
                      <h3>
                        {
                          product.name
                        }
                      </h3>

                      <p>
                        {
                          product.material
                        }
                      </p>
                    </div>

                    <strong>
                      {formatPrice(
                        product.price,
                      )}
                    </strong>
                  </div>
                </button>
              </article>
            ),
          )}
        </div>
      </section>

      <section id="featured">
        <div className="section-heading">
          <p className="section-eyebrow">
            BELLnBUY EDIT
          </p>

          <h2>
            Featured Pieces
          </h2>

          <p>
            A curated selection of
            BELLnBUY essentials
            built around clean
            silhouettes and
            everyday versatility.
          </p>
        </div>

        <div className="product-grid">
          {featuredProducts.map(
            (product) => (
              <article
                className="product-card"
                key={
                  product.id
                }
              >
                <button
                  type="button"
                  className="product-link"
                  onClick={() =>
                    openProduct(
                      product,
                    )
                  }
                  aria-label="View featured product"
                >
                  <div
                    className="product-image"
                    style={getProductImageStyle(
                      product
                        .images[0],
                    )}
                  >
                    <small className="product-badge">
                    </small>

                    {!product
                      .images[0] && (
                      <span>
                        {
                          product.status
                        }
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <div>
                      <h3>
                        {
                          product.name
                        }
                      </h3>

                      <p>
                        {
                          product.material
                        }
                      </p>
                    </div>

                    <strong>
                      {formatPrice(
                        product.price,
                      )}
                    </strong>
                  </div>
                </button>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        id="about"
        className="about-section"
      >
        <div className="section-heading">
          <p className="section-eyebrow">
            THE BRAND
          </p>

          <h2>
            About BELLnBUY
          </h2>

          <p>
            Minimal streetwear.
            Premium oversized
            tees. Crafted for
            Everyday Luxury.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-copy">
            <p>
              BELLnBUY is built
              around a simple idea:
              everyday clothing
              should feel premium
              without becoming
              complicated.
            </p>

            <p>
              Our focus is on
              oversized
              silhouettes, clean
              design, comfortable
              materials and
              timeless styling
              that fits naturally
              into everyday life.
            </p>

            <p>
              From essential
              pieces to statement
              drops, every
              BELLnBUY collection
              is designed with a
              minimal streetwear
              mindset.
            </p>
          </div>

          <div className="about-values">
            <div className="about-value">
              <span>01</span>

              <div>
                <h3>
                  Minimal Design
                </h3>

                <p>
                  Clean
                  silhouettes and
                  intentional
                  details.
                </p>
              </div>
            </div>

            <div className="about-value">
              <span>02</span>

              <div>
                <h3>
                  Premium Feel
                </h3>

                <p>
                  Focused on
                  quality, comfort
                  and everyday
                  wear.
                </p>
              </div>
            </div>

            <div className="about-value">
              <span>03</span>

              <div>
                <h3>
                  Made for
                  Everyday
                </h3>

                <p>
                  Versatile pieces
                  designed to become
                  daily essentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="product"
        className="product-detail"
      >
        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              <div
                className="product-image"
                style={getProductImageStyle(
                  selectedImage,
                )}
              >
                {!selectedImage && (
                  <span>
                    {selectedProduct
                      ? selectedProduct.status
                      : 'PRODUCT PREVIEW'}
                  </span>
                )}
              </div>
            </div>

            <div className="product-thumbnails">
              {selectedProduct &&
              selectedProduct
                .images.length >
                0 ? (
                selectedProduct.images.map(
                  (
                    image,
                    index,
                  ) => (
                    <button
                      key={
                        image +
                        '-' +
                        index
                      }
                      type="button"
                      className={
                        selectedImage ===
                        image
                          ? 'product-thumbnail active'
                          : 'product-thumbnail'
                      }
                      onClick={() =>
                        setSelectedImage(
                          image,
                        )
                      }
                      aria-label={
                        'Product image ' +
                        (index + 1)
                      }
                      style={{
                        backgroundImage: `url("${image}")`,
                        backgroundSize:
                          'cover',
                        backgroundPosition:
                          'center',
                        backgroundRepeat:
                          'no-repeat',
                      }}
                    />
                  ),
                )
              ) : (
                [1, 2, 3, 4].map(
                  (number) => (
                    <button
                      key={
                        number
                      }
                      type="button"
                      className={
                        number ===
                        1
                          ? 'product-thumbnail active'
                          : 'product-thumbnail'
                      }
                      aria-label={
                        'Product image ' +
                        number
                      }
                    />
                  ),
                )
              )}
            </div>
          </div>

          <div className="product-detail-info">
            <p className="product-detail-eyebrow">
              {selectedProduct
                ? selectedProduct.category
                : 'BELLnBUY ESSENTIALS'}
            </p>

            <h1>
              {selectedProduct
                ? selectedProduct.name
                : 'Oversized Essential Tee'}
            </h1>

            <p className="product-detail-price">
              {selectedProduct
                ? formatPrice(
                    selectedProduct.price,
                  )
                : 'Rs. —'}
            </p>

            {selectedProduct?.comparePrice &&
              selectedProduct.comparePrice >
                selectedProduct.price && (
                <p
                  style={{
                    marginTop:
                      '-10px',
                    marginBottom:
                      '18px',
                    opacity: 0.6,
                    textDecoration:
                      'line-through',
                  }}
                >
                  {formatPrice(
                    selectedProduct.comparePrice,
                  )}
                </p>
              )}

            <p className="product-detail-description">
              {selectedProduct?.description ||
                'Premium oversized T-shirt crafted for everyday comfort and a clean minimal look. Designed with premium cotton and a relaxed oversized silhouette.'}
            </p>

            <div className="option-group">
              <div className="option-label">
                <span>
                  Size
                </span>

                <span>
                  {selectedSize ||
                    'Select'}
                </span>
              </div>

              <div className="option-values">
                {(selectedProduct?.sizes
                  .length
                  ? selectedProduct.sizes
                  : [
                      'S',
                      'M',
                      'L',
                      'XL',
                    ]
                ).map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      className={
                        selectedSize ===
                        size
                          ? 'option-button active'
                          : 'option-button'
                      }
                      onClick={() =>
                        setSelectedSize(
                          size,
                        )
                      }
                    >
                      {size}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="option-group">
              <div className="option-label">
                <span>
                  Color
                </span>

                <span>
                  {selectedColor ||
                    'Select'}
                </span>
              </div>

              <div className="option-values">
                {(selectedProduct?.colors
                  .length
                  ? selectedProduct.colors
                  : [
                      'Black',
                      'White',
                    ]
                ).map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={
                        selectedColor ===
                        color
                          ? 'option-button active'
                          : 'option-button'
                      }
                      onClick={() =>
                        setSelectedColor(
                          color,
                        )
                      }
                    >
                      {color}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="option-group">
              <div className="option-label">
                <span>
                  Quantity
                </span>

                <span>
                  {quantity}
                </span>
              </div>

              <div className="quantity-selector">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={
                    decreaseQuantity
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="quantity-value">
                  {quantity}
                </span>

                <button
                  type="button"
                  className="quantity-button"
                  onClick={
                    increaseQuantity
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="add-to-cart"
              onClick={
                addToCart
              }
            >
              Add to Cart
            </button>

            {cartMessage && (
              <p className="cart-message">
                {cartMessage}
              </p>
            )}

            {selectedProduct && (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeProduct
                }
              >
                Back to Collection
              </button>
            )}
          </div>
        </div>

        <div
          className="reviews-section"
          id="reviews"
        >
          <div className="section-heading">
            <p className="section-eyebrow">
              CUSTOMER FEEDBACK
            </p>

            <h2>
              Reviews
            </h2>

            <p>
              Your experience
              matters. Share your
              thoughts about
              BELLnBUY.
            </p>
          </div>

          <div className="reviews-layout">
            <div className="reviews-summary">
              <div className="reviews-rating">
                ★★★★★
              </div>

              <h3>
                Love the fit?
              </h3>

              <p>
                Tell us what you
                think about your
                BELLnBUY
                experience.
              </p>
            </div>

            <form
              className="review-form"
              onSubmit={
                submitReview
              }
            >
              <div className="review-field">
                <label htmlFor="review-name">
                  Your Name
                </label>

                <input
                  id="review-name"
                  type="text"
                  value={
                    reviewName
                  }
                  onChange={(
                    event,
                  ) =>
                    setReviewName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="review-field">
                <label>
                  Rating
                </label>

                <div className="review-stars">
                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (star) => (
                      <button
                        key={
                          star
                        }
                        type="button"
                        className={
                          star <=
                          reviewRating
                            ? 'review-star active'
                            : 'review-star'
                        }
                        onClick={() =>
                          setReviewRating(
                            star,
                          )
                        }
                        aria-label={
                          'Give ' +
                          star +
                          ' star rating'
                        }
                      >
                        ★
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="review-field">
                <label htmlFor="review-text">
                  Your Review
                </label>

                <textarea
                  id="review-text"
                  value={
                    reviewText
                  }
                  onChange={(
                    event,
                  ) =>
                    setReviewText(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Write your review..."
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                className="add-to-cart review-submit"
                disabled={
                  reviewSubmitting
                }
              >
                {reviewSubmitting
                  ? 'Submitting...'
                  : 'Submit Review'}
              </button>

              {reviewSubmitted && (
                <p className="review-success">
                  Thank you! Your
                  review has been
                  submitted for
                  approval.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="contact-section"
      >
        <div className="section-heading">
          <p className="section-eyebrow">
            GET IN TOUCH
          </p>

          <h2>
            Let's Talk
          </h2>

          <p>
            Have a question about
            an order, product or
            BELLnBUY? Send us a
            message.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-information">
            <div className="contact-block">
              <span>
                EMAIL
              </span>

              <a href="mailto:teambnbworks@gmail.com">
                teambnbworks@gmail.com
              </a>
            </div>

            <div className="contact-block">
              <span>
                Instagram
              </span>

              <a
                href="https://www.instagram.com/bellnbuy/"
                target="_blank"
                rel="noreferrer"
              >
                @bellnbuy
              </a>
            </div>

            <div className="contact-block">
              <span>
                LOCATION
              </span>

              <p>
                Karachi,
                Pakistan
              </p>
            </div>

            <div className="contact-block">
              <span>
                Orders
              </span>

              <p>
                Karachi Delivery ·
                Cash on Delivery
              </p>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={
              submitContact
            }
          >
            <div className="contact-field">
              <label htmlFor="contact-name">
                Your Name
              </label>

              <input
                id="contact-name"
                type="text"
                value={
                  contactName
                }
                onChange={(
                  event,
                ) =>
                  setContactName(
                    event.target
                      .value,
                  )
                }
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">
                Email Address
              </label>

              <input
                id="contact-email"
                type="email"
                value={
                  contactEmail
                }
                onChange={(
                  event,
                ) =>
                  setContactEmail(
                    event.target
                      .value,
                  )
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">
                Message
              </label>

              <textarea
                id="contact-message"
                value={
                  contactMessage
                }
                onChange={(
                  event,
                ) =>
                  setContactMessage(
                    event.target
                      .value,
                  )
                }
                placeholder="How can we help?"
                rows={6}
                required
              />
            </div>

            <button
              type="submit"
              className="add-to-cart"
              disabled={
                contactSubmitting
              }
            >
              {contactSubmitting
                ? 'Sending...'
                : 'Send Message'}
            </button>

            {contactSubmitted && (
              <p className="contact-success">
                Thank you! Your
                message has been
                received. We will
                get back to you
                soon.
              </p>
            )}
          </form>
        </div>
      </section>

      <section
        id="cart"
        className="cart-page"
      >
        <div className="cart-header">
          <p className="section-eyebrow">
            YOUR BAG
          </p>

          <h1>
            Cart
          </h1>

          <p>
            Your selected BELLnBUY
            pieces will appear
            here.
          </p>
        </div>

        {cartItems.length ===
        0 ? (
          <div className="empty-state">
            <h2>
              Your cart is empty
            </h2>

            <p>
              Add your favorite
              BELLnBUY pieces to
              your cart and they
              will appear here.
            </p>

            <a
              href="#shop"
              className="primary-button"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(
                (item) => (
                  <article
                    className="cart-item"
                    key={
                      item.id +
                      '-' +
                      item.size +
                      '-' +
                      item.color
                    }
                  >
                    <div className="cart-item-image">
                      <span>
                        {
                          item.name
                        }
                      </span>
                    </div>

                    <div className="cart-item-info">
                      <h2>
                        {
                          item.name
                        }
                      </h2>

                      <p>
                        {
                          item.material
                        }
                      </p>

                      <p>
                        Size:{' '}
                        {
                          item.size
                        }
                      </p>

                      <p>
                        Color:{' '}
                        {
                          item.color
                        }
                      </p>

                      <strong>
                        {formatPrice(
                          item.price,
                        )}
                      </strong>

                      <div className="cart-item-actions">
                        <div className="quantity-selector">
                          <button
                            type="button"
                            className="quantity-button"
                            onClick={() =>
                              decreaseCartQuantity(
                                item.id,
                                item.size,
                                item.color,
                              )
                            }
                            aria-label="Decrease cart quantity"
                          >
                            −
                          </button>

                          <span className="quantity-value">
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            className="quantity-button"
                            onClick={() =>
                              increaseCartQuantity(
                                item.id,
                                item.size,
                                item.color,
                              )
                            }
                            aria-label="Increase cart quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-button"
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.size,
                              item.color,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            <aside className="cart-summary">
              <h2>
                Order Summary
              </h2>

              <div className="cart-summary-row">
                <span>
                  Items
                </span>

                <strong>
                  {
                    cartItemCount
                  }
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatPrice(
                    subtotal,
                  )}
                </strong>
              </div>

              <div className="cart-summary-total">
                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(
                    grandTotal,
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="add-to-cart"
                onClick={
                  openCheckout
                }
              >
                Proceed to
                Checkout
              </button>
            </aside>
          </div>
        )}
      </section>

      {checkoutOpen && (
        <section
          id="checkout"
          className="checkout-section"
        >
          {orderPlaced ? (
            <div className="checkout-content order-confirmation">
              <p className="section-eyebrow">
                ORDER CONFIRMED
              </p>

              <h1>
                Thank You for Your
                Order
              </h1>

              <p>
                Your BELLnBUY order
                has been received
                successfully.
              </p>

              <div className="order-number">
                <span>
                  Order Number
                </span>

                <strong>
                  {
                    orderNumber
                  }
                </strong>
              </div>

              <div className="order-confirmation-details">
                <p>
                  <strong>
                    Payment:
                  </strong>{' '}
                  Cash on Delivery
                </p>

                <p>
                  <strong>
                    Delivery:
                  </strong>{' '}
                  {customerCity}
                </p>

                <p>
                  <strong>
                    Customer:
                  </strong>{' '}
                  {
                    customerName
                  }
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{' '}
                  {
                    customerEmail
                  }
                </p>

                <p>
                  <strong>
                    Phone:
                  </strong>{' '}
                  {
                    customerPhone
                  }
                </p>

                <p>
                  <strong>
                    Address:
                  </strong>{' '}
                  {
                    customerAddress
                  }
                </p>

                <p>
                  <strong>
                    Area:
                  </strong>{' '}
                  {
                    customerArea
                  }
                </p>

                <p>
                  <strong>
                    City:
                  </strong>{' '}
                  {
                    customerCity
                  }
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setCheckoutOpen(
                    false,
                  )

                  setOrderPlaced(
                    false,
                  )

                  setCustomerName(
                    '',
                  )

                  setCustomerEmail(
                    '',
                  )

                  setCustomerPhone(
                    '',
                  )

                  setCustomerArea(
                    '',
                  )

                  setCustomerAddress(
                    '',
                  )

                  setCustomerCity(
                    'Karachi',
                  )

                  setCustomerProvince(
                    'Sindh',
                  )

                  setCustomerPostalCode(
                    '',
                  )
                }}
              >
                Continue
                Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-header">
                <p className="section-eyebrow">
                  SECURE CHECKOUT
                </p>

                <h1>
                  Complete Your
                  Order
                </h1>

                <p>
                  Enter your details
                  below to place your
                  BELLnBUY order.
                </p>
              </div>

              <div className="checkout-content">
                <form
                  onSubmit={
                    placeOrder
                  }
                >
                  <div className="checkout-form">
                    <div className="checkout-field">
                      <label htmlFor="customer-name">
                        Full Name
                      </label>

                      <input
                        id="customer-name"
                        type="text"
                        value={
                          customerName
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerName(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-email">
                        Email Address
                      </label>

                      <input
                        id="customer-email"
                        type="email"
                        value={
                          customerEmail
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerEmail(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="you@example.com"
                        required
                      />

                      <small>
                        Your order confirmation and delivery updates will be sent to this email.
                      </small>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-phone">
                        Phone Number
                      </label>

                      <input
                        id="customer-phone"
                        type="tel"
                        value={
                          customerPhone
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerPhone(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="03XX XXXXXXX"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-address">
                        Complete Delivery
                        Address
                      </label>

                      <textarea
                        id="customer-address"
                        value={
                          customerAddress
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerAddress(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="House, street, block, building..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-area">
                        Area / Town
                      </label>

                      <input
                        id="customer-area"
                        type="text"
                        value={
                          customerArea
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerArea(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="e.g. Gulshan-e-Iqbal"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-city">
                        City
                      </label>

                      <select
                        id="customer-city"
                        value={
                          customerCity
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerCity(
                            event
                              .target
                              .value,
                          )
                        }
                        required
                      >
                        <option value="Karachi">
                          Karachi
                        </option>
                      </select>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-province">
                        Province
                      </label>

                      <select
                        id="customer-province"
                        value={
                          customerProvince
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerProvince(
                            event
                              .target
                              .value,
                          )
                        }
                        required
                      >
                        <option value="Sindh">
                          Sindh
                        </option>

                        <option value="Punjab">
                          Punjab
                        </option>

                        <option value="Balochistan">
                          Balochistan
                        </option>

                        <option value="Khyber Pakhtunkhwa">
                          Khyber Pakhtunkhwa
                        </option>

                        <option value="Islamabad Capital Territory">
                          Islamabad Capital Territory
                        </option>
                      </select>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-postal-code">
                        Postal Code
                        <span>
                          {' '}
                          Optional
                        </span>
                      </label>

                      <input
                        id="customer-postal-code"
                        type="text"
                        value={
                          customerPostalCode
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerPostalCode(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  <div className="payment-method">
                    <div>
                      <span className="payment-label">
                        Payment Method
                      </span>

                      <h2>
                        Cash on
                        Delivery
                      </h2>

                      <p>
                        Pay when your
                        BELLnBUY order
                        is delivered to
                        you.
                      </p>
                    </div>

                    <span className="payment-badge">
                      COD
                    </span>
                  </div>

                  {orderError && (
                    <p className="cart-message">
                      {
                        orderError
                      }
                    </p>
                  )}

                  <div className="checkout-summary">
                    <div className="cart-summary-row">
                      <span>
                        Items
                      </span>

                      <strong>
                        {
                          cartItemCount
                        }
                      </strong>
                    </div>

                    <div className="cart-summary-row">
                      <span>
                        Subtotal
                      </span>

                      <strong>
                        {formatPrice(
                          subtotal,
                        )}
                      </strong>
                    </div>

                    <div className="cart-summary-total">
                      <span>
                        Total
                      </span>

                      <strong>
                        {formatPrice(
                          grandTotal,
                        )}
                      </strong>
                    </div>
                  </div>

                  <label className="delivery-confirmation">
                    <input
                      type="checkbox"
                      checked={
                        deliveryConfirmed
                      }
                      onChange={(
                        event,
                      ) =>
                        setDeliveryConfirmed(
                          event
                            .target
                            .checked,
                        )
                      }
                      required
                    />

                    <span>
                      Minimum delivery
                      charges Rs. 199
                      for your order
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="add-to-cart"
                    disabled={
                      orderSubmitting
                    }
                  >
                    {orderSubmitting
                      ? 'Placing Order...'
                      : 'Place Order'}
                  </button>
                </form>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeCheckout
                  }
                >
                  Back to Cart
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <section
        id="shipping"
        className="information-section"
      >
        <div className="information-grid">
          <div>
            <p className="section-eyebrow">
              DELIVERY
            </p>

            <h2>
              Shipping
              Information
            </h2>
          </div>

          <div>
            <p>
              BELLnBUY currently
              offers delivery
              within Karachi.
            </p>

            <p>
              Orders are placed
              through Cash on
              Delivery. Delivery
              timing and order
              confirmation will be
              communicated as the
              store moves into its
              live ordering phase.
            </p>
          </div>
        </div>
      </section>

      <section
        id="returns"
        className="information-section"
      >
        <div className="information-grid">
          <div>
            <p className="section-eyebrow">
              RETURNS
            </p>

            <h2>
              Returns &
              Exchanges
            </h2>
          </div>

          <div>
            <p>
              Return and exchange
              eligibility will be
              based on the final
              BELLnBUY store
              policy.
            </p>

            <p>
              Products must remain
              unused and in their
              original condition
              when an eligible
              return or exchange is
              requested.
            </p>

            <p>
              Full operational
              return rules will be
              finalized before the
              store goes live with
              real inventory.
            </p>
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="information-section"
      >
        <div className="information-grid">
          <div>
            <p className="section-eyebrow">
              PRIVACY
            </p>

            <h2>
              Privacy Policy
            </h2>
          </div>

          <div>
            <p>
              BELLnBUY will only
              use customer
              information needed to
              process orders,
              communicate about
              purchases and provide
              customer support.
            </p>

            <p>
              Customer information
              will not be displayed
              publicly on the
              website.
            </p>

            <p>
              The final production
              privacy policy will
              be completed before
              live database and
              order processing are
              enabled.
            </p>
          </div>
        </div>
      </section>

      <section
        id="terms"
        className="information-section"
      >
        <div className="information-grid">
          <div>
            <p className="section-eyebrow">
              TERMS
            </p>

            <h2>
              Terms &
              Conditions
            </h2>
          </div>

          <div>
            <p>
              By placing an order
              through BELLnBUY,
              customers agree to
              provide accurate
              contact and delivery
              information.
            </p>

            <p>
              Product
              availability,
              pricing, delivery,
              returns and
              exchanges will be
              governed by the final
              published BELLnBUY
              store policies.
            </p>

            <p>
              Final production
              terms will be
              completed before live
              commerce functionality
              is enabled.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="section-eyebrow">
            BELLnBUY
          </p>

          <h2>
            Crafted for Everyday
            Luxury.
          </h2>

          <p>
            Minimal streetwear
            designed to become part
            of your everyday
            wardrobe.
          </p>

          <a
            href="#shop"
            className="hero-button"
          >
            Explore the
            Collection
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-main">
          <div className="footer-brand">
            <img
              src={logo}
              alt="BELLnBUY"
              width="170"
            />

            <p>
              Minimal Streetwear.
              <br />
              Premium Oversized
              Tees.
              <br />
              Crafted for Everyday
              Luxury.
            </p>

            <a
              href="https://www.instagram.com/bellnbuy/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram →
            </a>
          </div>

          <div className="footer-column">
            <h3>
              Shop
            </h3>

            <a href="#shop">
              All Products
            </a>

            <a href="#new-arrivals">
              New Arrivals
            </a>

            <a href="#featured">
              Featured
            </a>

            <a href="#cart">
              Cart
            </a>
          </div>

          <div className="footer-column">
            <h3>
              Information
            </h3>

            <a href="#about">
              About
            </a>

            <a href="#shipping">
              Shipping
            </a>

            <a href="#returns">
              Returns &
              Exchanges
            </a>

            <a href="#contact">
              Contact
            </a>
          </div>

          <div className="footer-column">
            <h3>
              Policies
            </h3>

            <a href="#privacy">
              Privacy Policy
            </a>

            <a href="#terms">
              Terms &
              Conditions
            </a>

            <a href="#reviews">
              Reviews
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 BELLnBUY. All
            rights reserved.
          </p>

          <p>
            Karachi · Pakistan
          </p>
        </div>
      </footer>
    </main>
  )
}

export default App