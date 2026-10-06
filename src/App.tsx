import { useState } from 'react'
import logo from './assets/BNB-10-10.png'
import './App.css'

type Product = {
  id: number
  name: string
  material: string
  price: string
  status: string
  category: string
}

type CartItem = {
  id: number
  name: string
  material: string
  price: string
  size: string
  color: string
  quantity: number
}

const products: Product[] = [
  {
    id: 1,
    name: 'Oversized Essential Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 'Rs. —',
    status: 'COMING SOON',
    category: 'ESSENTIALS',
  },
  {
    id: 2,
    name: 'Signature Oversized Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 'Rs. —',
    status: 'COMING SOON',
    category: 'SIGNATURE',
  },
  {
    id: 3,
    name: 'Minimal Everyday Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 'Rs. —',
    status: 'COMING SOON',
    category: 'ESSENTIALS',
  },
  {
    id: 4,
    name: 'Classic Drop Shoulder Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 'Rs. —',
    status: 'COMING SOON',
    category: 'DROP SHOULDER',
  },
  {
    id: 5,
    name: 'Urban Essential Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 'Rs. —',
    status: 'COMING SOON',
    category: 'ESSENTIALS',
  },
  {
    id: 6,
    name: 'Premium Daily Tee',
    material: 'Premium Cotton · 240 GSM',
    price: 'Rs. —',
    status: 'COMING SOON',
    category: 'SIGNATURE',
  },
]

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartMessage, setCartMessage] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerCity, setCustomerCity] = useState('Karachi')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const filteredProducts =
    activeFilter === 'ALL'
      ? products
      : products.filter(
          (product) => product.category === activeFilter,
        )

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setCartMessage('')

    window.setTimeout(() => {
      document.getElementById('product')?.scrollIntoView({
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
    setCartMessage('')
  }

  const increaseQuantity = () => {
    setQuantity((current) => current + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((current) => {
      if (current <= 1) {
        return 1
      }

      return current - 1
    })
  }

  const addToCart = () => {
    if (!selectedProduct) {
      return
    }

    if (!selectedSize || !selectedColor) {
      setCartMessage('Please select a size and color first.')
      return
    }

    const existingItem = cartItems.find(
      (item) =>
        item.id === selectedProduct.id &&
        item.size === selectedSize &&
        item.color === selectedColor,
    )

    if (existingItem) {
      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (
            item.id === selectedProduct.id &&
            item.size === selectedSize &&
            item.color === selectedColor
          ) {
            return {
              ...item,
              quantity: item.quantity + quantity,
            }
          }

          return item
        }),
      )
    } else {
      const newItem: CartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        material: selectedProduct.material,
        price: selectedProduct.price,
        size: selectedSize,
        color: selectedColor,
        quantity,
      }

      setCartItems((currentItems) => [
        ...currentItems,
        newItem,
      ])
    }

    setCartMessage('Added to cart successfully.')
  }

  const increaseCartQuantity = (
    itemId: number,
    size: string,
    color: string,
  ) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (
          item.id === itemId &&
          item.size === size &&
          item.color === color
        ) {
          return {
            ...item,
            quantity: item.quantity + 1,
          }
        }

        return item
      }),
    )
  }

  const decreaseCartQuantity = (
    itemId: number,
    size: string,
    color: string,
  ) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (
            item.id === itemId &&
            item.size === size &&
            item.color === color
          ) {
            return {
              ...item,
              quantity: item.quantity - 1,
            }
          }

          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (
    itemId: number,
    size: string,
    color: string,
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.id === itemId &&
            item.size === size &&
            item.color === color
          ),
      ),
    )
  }

  const openCheckout = () => {
    setCheckoutOpen(true)
    setOrderPlaced(false)

    window.setTimeout(() => {
      document.getElementById('checkout')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    setOrderPlaced(false)
  }

  const placeOrder = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const generatedOrderNumber =
      'BNB-' + String(Date.now()).slice(-8)

    setOrderNumber(generatedOrderNumber)
    setOrderPlaced(true)
    setCartItems([])
  }

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  return (
    <main>
      <div className="announcement-bar">
        Pakistan · Premium Oversized Tees · Crafted for Everyday Luxury
      </div>

      <header>
        <a
          href="/"
          aria-label="BELLnBUY home"
          onClick={closeMobileMenu}
        >
          <img
            src={logo}
            alt="BELLnBUY"
            width="200"
          />
        </a>

        <nav aria-label="Main navigation">
          <a href="#shop">Shop</a>
          <a href="#new-arrivals">New Arrivals</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#cart">
            Cart
            {cartItemCount > 0
              ? ' (' + cartItemCount + ')'
              : ''}
          </a>
        </nav>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
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
        onClick={closeMobileMenu}
      />

      <aside
        className={
          mobileMenuOpen
            ? 'mobile-menu active'
            : 'mobile-menu'
        }
        aria-hidden={!mobileMenuOpen}
      >
        <button
          className="mobile-menu-close"
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        >
          ×
        </button>

        <nav aria-label="Mobile navigation">
          <a href="#shop" onClick={closeMobileMenu}>
            Shop
          </a>

          <a href="#new-arrivals" onClick={closeMobileMenu}>
            New Arrivals
          </a>

          <a href="#about" onClick={closeMobileMenu}>
            About
          </a>

          <a href="#contact" onClick={closeMobileMenu}>
            Contact
          </a>

          <a href="#cart" onClick={closeMobileMenu}>
            Cart
            {cartItemCount > 0
              ? ' (' + cartItemCount + ')'
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
            Premium oversized tees crafted for everyday luxury.
            Designed with a minimal approach and made for
            everyday wear.
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

          <h2>Shop BELLnBUY</h2>

          <p>
            Premium oversized tees designed with a minimal
            approach and made for everyday luxury.
          </p>
        </div>

        <div className="shop-toolbar">
          <div className="shop-filters">
            <button
              type="button"
              className={
                activeFilter === 'ALL'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setActiveFilter('ALL')}
            >
              All
            </button>

            <button
              type="button"
              className={
                activeFilter === 'ESSENTIALS'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setActiveFilter('ESSENTIALS')}
            >
              Essentials
            </button>

            <button
              type="button"
              className={
                activeFilter === 'SIGNATURE'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setActiveFilter('SIGNATURE')}
            >
              Signature
            </button>

            <button
              type="button"
              className={
                activeFilter === 'DROP SHOULDER'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() =>
                setActiveFilter('DROP SHOULDER')
              }
            >
              Drop Shoulder
            </button>
          </div>

          <div className="shop-toolbar-count">
            {filteredProducts.length} Products
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article
              className="product-card"
              key={product.id}
            >
              <button
                type="button"
                className="product-link"
                onClick={() => openProduct(product)}
                aria-label="View product"
              >
                <div className="product-image">
                  <span>{product.status}</span>
                </div>

                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.material}</p>
                  </div>

                  <strong>{product.price}</strong>
                </div>
              </button>
            </article>
          ))}
        </div>

        <div
          className="pagination"
          aria-label="Product pagination"
        >
          <button
            className="pagination-number active"
            type="button"
          >
            1
          </button>

          <button
            className="pagination-number"
            type="button"
          >
            2
          </button>

          <button
            className="pagination-number"
            type="button"
          >
            3
          </button>

          <button
            className="pagination-number"
            type="button"
          >
            4
          </button>

          <button
            className="pagination-number"
            type="button"
          >
            5
          </button>

          <button
            className="pagination-next"
            type="button"
          >
            Next →
          </button>
        </div>
      </section>

      <section id="new-arrivals">
        <div className="section-heading">
          <p className="section-eyebrow">
            LATEST DROP
          </p>

          <h2>New Arrivals</h2>

          <p>
            Discover the latest pieces from the BELLnBUY
            collection. New products will appear here
            automatically when published.
          </p>
        </div>

        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <article
              className="product-card"
              key={product.id}
            >
              <button
                type="button"
                className="product-link"
                onClick={() => openProduct(product)}
                aria-label="View new arrival"
              >
                <div className="product-image">
                  <span>NEW ARRIVAL</span>
                </div>

                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.material}</p>
                  </div>

                  <strong>{product.price}</strong>
                </div>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        id="product"
        className="product-detail"
      >
        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              <div className="product-image">
                <span>
                  {selectedProduct
                    ? selectedProduct.status
                    : 'PRODUCT PREVIEW'}
                </span>
              </div>
            </div>

            <div className="product-thumbnails">
              <button
                type="button"
                className="product-thumbnail active"
                aria-label="Product image 1"
              />

              <button
                type="button"
                className="product-thumbnail"
                aria-label="Product image 2"
              />

              <button
                type="button"
                className="product-thumbnail"
                aria-label="Product image 3"
              />

              <button
                type="button"
                className="product-thumbnail"
                aria-label="Product image 4"
              />
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
                ? selectedProduct.price
                : 'Rs. —'}
            </p>

            <p className="product-detail-description">
              Premium oversized T-shirt crafted for everyday
              comfort and a clean minimal look. Designed with
              premium cotton and a relaxed oversized silhouette.
            </p>

            <div className="option-group">
              <div className="option-label">
                <span>Size</span>

                <span>
                  {selectedSize
                    ? selectedSize
                    : 'Select'}
                </span>
              </div>

              <div className="option-values">
                <button
                  type="button"
                  className={
                    selectedSize === 'S'
                      ? 'option-button active'
                      : 'option-button'
                  }
                  onClick={() => setSelectedSize('S')}
                >
                  S
                </button>

                <button
                  type="button"
                  className={
                    selectedSize === 'M'
                      ? 'option-button active'
                      : 'option-button'
                  }
                  onClick={() => setSelectedSize('M')}
                >
                  M
                </button>

                <button
                  type="button"
                  className={
                    selectedSize === 'L'
                      ? 'option-button active'
                      : 'option-button'
                  }
                  onClick={() => setSelectedSize('L')}
                >
                  L
                </button>

                <button
                  type="button"
                  className={
                    selectedSize === 'XL'
                      ? 'option-button active'
                      : 'option-button'
                  }
                  onClick={() => setSelectedSize('XL')}
                >
                  XL
                </button>
              </div>
            </div>

            <div className="option-group">
              <div className="option-label">
                <span>Color</span>

                <span>
                  {selectedColor
                    ? selectedColor
                    : 'Select'}
                </span>
              </div>

              <div className="option-values">
                <button
                  type="button"
                  className={
                    selectedColor === 'Black'
                      ? 'option-button active'
                      : 'option-button'
                  }
                  onClick={() =>
                    setSelectedColor('Black')
                  }
                >
                  Black
                </button>

                <button
                  type="button"
                  className={
                    selectedColor === 'White'
                      ? 'option-button active'
                      : 'option-button'
                  }
                  onClick={() =>
                    setSelectedColor('White')
                  }
                >
                  White
                </button>
              </div>
            </div>

            <div className="option-group">
              <div className="option-label">
                <span>Quantity</span>

                <span>{quantity}</span>
              </div>

              <div className="quantity-selector">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={decreaseQuantity}
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
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="add-to-cart"
              onClick={addToCart}
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
                onClick={closeProduct}
              >
                Back to Collection
              </button>
            )}
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>

            <div className="review-summary">
              <span className="review-stars">
                ★★★★★
              </span>

              <span className="review-score">
                No reviews yet
              </span>
            </div>
          </div>

          <div className="empty-state">
            <h2>Be the first to review</h2>

            <p>
              Customer reviews will appear here after
              approved reviews are submitted.
            </p>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="section-heading">
          <p className="section-eyebrow">
            THE BRAND
          </p>

          <h2>About BELLnBUY</h2>

          <p>
            Minimal streetwear. Premium oversized tees.
            Crafted for Everyday Luxury.
          </p>
        </div>
      </section>

      <section id="contact">
        <div className="section-heading">
          <p className="section-eyebrow">
            GET IN TOUCH
          </p>

          <h2>Contact</h2>

          <p>
            Have a question about an order or product?
            Get in touch with BELLnBUY.
          </p>

          <a
            href="https://www.instagram.com/bellnbuy/"
            className="contact-link"
            target="_blank"
            rel="noreferrer"
          >
            Instagram →
          </a>
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

          <h1>Cart</h1>

          <p>
            Your selected BELLnBUY pieces will appear here.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty</h2>

            <p>
              Add your favorite BELLnBUY pieces to your cart
              and they will appear here.
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
              {cartItems.map((item) => (
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
                    <span>{item.name}</span>
                  </div>

                  <div className="cart-item-info">
                    <h2>{item.name}</h2>

                    <p>{item.material}</p>

                    <p>
                      Size: {item.size}
                    </p>

                    <p>
                      Color: {item.color}
                    </p>

                    <strong>{item.price}</strong>

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
                          {item.quantity}
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
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items</span>
                <strong>{cartItemCount}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong>Rs. 200</strong>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>
                <strong>Rs. —</strong>
              </div>

              <button
                type="button"
                className="add-to-cart"
                onClick={openCheckout}
              >
                Proceed to Checkout
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

              <h1>Thank You for Your Order</h1>

              <p>
                Your BELLnBUY order has been received
                successfully.
              </p>

              <div className="order-number">
                <span>Order Number</span>
                <strong>{orderNumber}</strong>
              </div>

              <div className="order-confirmation-details">
                <p>
                  <strong>Payment:</strong> Cash on Delivery
                </p>

                <p>
                  <strong>Delivery:</strong> Karachi · Rs. 200
                </p>

                <p>
                  <strong>Customer:</strong> {customerName}
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setCheckoutOpen(false)
                  setOrderPlaced(false)
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-header">
                <p className="section-eyebrow">
                  SECURE CHECKOUT
                </p>

                <h1>Complete Your Order</h1>

                <p>
                  Enter your details below to place your
                  BELLnBUY order.
                </p>
              </div>

              <div className="checkout-content">
                <form onSubmit={placeOrder}>
                  <div className="checkout-form">
                    <div className="checkout-field">
                      <label htmlFor="customer-name">
                        Full Name
                      </label>

                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-phone">
                        Phone Number
                      </label>

                      <input
                        id="customer-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(event) =>
                          setCustomerPhone(event.target.value)
                        }
                        placeholder="03XX XXXXXXX"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-address">
                        Complete Delivery Address
                      </label>

                      <textarea
                        id="customer-address"
                        value={customerAddress}
                        onChange={(event) =>
                          setCustomerAddress(event.target.value)
                        }
                        placeholder="House, street, area, block..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="customer-city">
                        City
                      </label>

                      <select
                        id="customer-city"
                        value={customerCity}
                        onChange={(event) =>
                          setCustomerCity(event.target.value)
                        }
                        required
                      >
                        <option value="Karachi">
                          Karachi
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="payment-method">
                    <div>
                      <span className="payment-label">
                        Payment Method
                      </span>

                      <h2>Cash on Delivery</h2>

                      <p>
                        Pay when your BELLnBUY order is
                        delivered to you.
                      </p>
                    </div>

                    <span className="payment-badge">
                      COD
                    </span>
                  </div>

                  <div className="checkout-summary">
                    <div className="cart-summary-row">
                      <span>Items</span>
                      <strong>{cartItemCount}</strong>
                    </div>

                    <div className="cart-summary-row">
                      <span>Delivery</span>
                      <strong>Rs. 200</strong>
                    </div>

                    <div className="cart-summary-total">
                      <span>Total</span>
                      <strong>Rs. —</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="add-to-cart"
                  >
                    Place Order
                  </button>
                </form>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCheckout}
                >
                  Back to Cart
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <footer>
        <p>
          © 2026 BELLnBUY. All rights reserved.
        </p>

        <div className="footer-links">
          <a href="#shop">Shop</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <a
            href="https://www.instagram.com/bellnbuy/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </div>
      </footer>
    </main>
  )
}

export default App