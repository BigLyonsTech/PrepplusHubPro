import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { brownHoodie, redHoodie, whiteHoodie, blueHoodie } from '@/assets/products'
import { generateProducts } from '@/lib/generateProducts'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

const emptyCart = { items: [], subtotal: 0, discount: 0, shipping: 0, total: 0 }

const initialState = {
  products: [
    {
      id: 'p-1',
      name: 'Woven Raffia Tote',
      vendor: 'Lagos Leather Co.',
      vendorId: 'v-1001',
      price: 24500,
      category: 'Fashion',
      rating: 4.6,
      reviewCount: 38,
      description: 'Hand-woven raffia tote with a leather-trimmed strap. Made in small batches.',
    },
    {
      id: 'p-2',
      name: 'Noise-Isolating Earbuds',
      vendor: 'Everstock Electronics',
      vendorId: 'v-1002',
      price: 38900,
      originalPrice: 54900,
      category: 'Electronics',
      rating: 4.3,
      reviewCount: 112,
      description: '30-hour battery life, USB-C fast charge, IPX5 water resistance.',
    },
    {
      id: 'p-3',
      name: 'Ceramic Pour-Over Set',
      vendor: 'Kiln & Co.',
      vendorId: 'v-1003',
      price: 15900,
      category: 'Home',
      rating: 4.8,
      reviewCount: 61,
      // Real image via Cloudinary's public "demo" cloud — see lib/cloudinary.js.
      // Products without an `image` fall back to a category icon in ProductThumb.
      image: 'sample',
      description: 'Hand-thrown ceramic dripper and matching carafe, 500ml capacity.',
    },
    {
      id: 'p-4',
      name: 'Shea & Oat Body Cream',
      vendor: 'Bare Botanicals',
      vendorId: 'v-1004',
      price: 8500,
      originalPrice: 12000,
      category: 'Beauty',
      rating: 4.7,
      reviewCount: 204,
      description: 'Whipped shea butter with colloidal oat, fragrance-free, for sensitive skin.',
    },
    {
      id: 'p-5',
      name: 'Everyday Canvas Sneakers',
      vendor: 'Field & Form',
      vendorId: 'v-1005',
      price: 21000,
      originalPrice: 28000,
      category: 'Fashion',
      rating: 4.4,
      reviewCount: 87,
      image: 'ai/model_plain_sweatshirt',
      description: 'Low-top canvas sneakers with a recycled-rubber sole. True to size.',
    },
    {
      id: 'p-6',
      name: 'Mechanical Keyboard — 65%',
      vendor: 'Everstock Electronics',
      vendorId: 'v-1002',
      price: 54000,
      category: 'Electronics',
      rating: 4.5,
      reviewCount: 76,
      description: 'Hot-swappable switches, PBT keycaps, USB-C detachable cable.',
    },
    {
      id: 'p-7',
      name: 'Linen Table Runner',
      vendor: 'Kiln & Co.',
      vendorId: 'v-1003',
      price: 9200,
      category: 'Home',
      rating: 4.9,
      reviewCount: 29,
      description: 'Stonewashed linen, 180cm, machine washable.',
    },
    {
      id: 'p-8',
      name: 'Trail-Ready Backpack 22L',
      vendor: 'Field & Form',
      vendorId: 'v-1005',
      price: 32500,
      originalPrice: 41000,
      category: 'Sports',
      rating: 4.5,
      reviewCount: 54,
      description: 'Weatherproof shell, padded laptop sleeve, side water-bottle pockets.',
    },
    {
      id: 'p-9',
      name: 'Classic Pullover Hoodie — Sand',
      vendor: 'Field & Form',
      vendorId: 'v-1005',
      price: 19500,
      category: 'Fashion',
      rating: 4.7,
      reviewCount: 44,
      image: brownHoodie,
      description: 'Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.',
    },
    {
      id: 'p-10',
      name: 'Classic Pullover Hoodie — Burgundy',
      vendor: 'Field & Form',
      vendorId: 'v-1005',
      price: 19500,
      originalPrice: 24000,
      category: 'Fashion',
      rating: 4.8,
      reviewCount: 61,
      image: redHoodie,
      description: 'Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.',
    },
    {
      id: 'p-11',
      name: 'Classic Pullover Hoodie — White',
      vendor: 'Field & Form',
      vendorId: 'v-1005',
      price: 19500,
      category: 'Fashion',
      rating: 4.6,
      reviewCount: 29,
      image: whiteHoodie,
      description: 'Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.',
    },
    {
      id: 'p-12',
      name: 'Classic Pullover Hoodie — Sky Blue',
      vendor: 'Field & Form',
      vendorId: 'v-1005',
      price: 19500,
      category: 'Fashion',
      rating: 4.7,
      reviewCount: 33,
      image: blueHoodie,
      description: 'Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.',
    },
    // 12 curated products above have real photography. Everything below is
    // generated to bring the catalog to Temu-like volume — they render fine
    // via ProductThumb's category-icon fallback for items with no `image`.
    ...generateProducts(140),
  ],
  cart: emptyCart, // server-computed: { items: [{productId, name, image, price, originalPrice, quantity}], subtotal, discount, shipping, total }
  wishlist: [], // [ productId ]
  productReviews: [], // populated from the backend via fetchProductReviews
  vendorReviews: [], // populated from the backend via fetchVendorReviews
  orders: [], // populated from the backend via fetchOrders
}

export const fetchProducts = createAsyncThunk('catalog/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    return await apiGet('/products')
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchCart = createAsyncThunk('catalog/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await apiGet('/cart')
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addCartItem = createAsyncThunk(
  'catalog/addCartItem',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await apiPost('/cart/items', { productId, quantity })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateCartItemQuantity = createAsyncThunk(
  'catalog/updateCartItemQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await apiPut(`/cart/items/${productId}`, { quantity })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const removeCartItem = createAsyncThunk('catalog/removeCartItem', async (productId, { rejectWithValue }) => {
  try {
    return await apiDelete(`/cart/items/${productId}`)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const clearCartRemote = createAsyncThunk('catalog/clearCartRemote', async (_, { rejectWithValue }) => {
  try {
    return await apiDelete('/cart')
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchOrders = createAsyncThunk('catalog/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    return await apiGet('/orders')
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createOrder = createAsyncThunk('catalog/createOrder', async (deliveryAddress, { rejectWithValue }) => {
  try {
    return await apiPost('/orders', { deliveryAddress })
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const verifyPayment = createAsyncThunk('catalog/verifyPayment', async (reference, { rejectWithValue }) => {
  try {
    return await apiPost(`/payments/verify/${reference}`, {})
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchProductReviews = createAsyncThunk(
  'catalog/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      return await apiGet(`/reviews/products/${productId}`)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const submitProductReview = createAsyncThunk(
  'catalog/submitProductReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      return await apiPost('/reviews/products', { productId, rating, comment })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchVendorReviews = createAsyncThunk(
  'catalog/fetchVendorReviews',
  async (vendorId, { rejectWithValue }) => {
    try {
      return await apiGet(`/reviews/vendors/${vendorId}`)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const submitVendorReview = createAsyncThunk(
  'catalog/submitVendorReview',
  async ({ vendorId, rating, comment, orderId }, { rejectWithValue }) => {
    try {
      return await apiPost('/reviews/vendors', { vendorId, rating, comment, orderId })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const id = action.payload
      state.wishlist = state.wishlist.includes(id)
        ? state.wishlist.filter((w) => w !== id)
        : [...state.wishlist, id]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length) {
          state.products = action.payload.map((product) => ({
            ...product,
            id: product.id || product._id,
            image: product.image || undefined,
          }))
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products = initialState.products
        console.error('Failed to fetch products from backend:', action.payload)
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      .addCase(clearCartRemote.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders = [action.payload, ...state.orders]
        state.cart = emptyCart // server already cleared the cart when the order was created
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        const updated = action.payload
        state.orders = state.orders.map((order) => (order.id === updated.id ? updated : order))
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        const productId = action.meta.arg
        state.productReviews = [
          ...state.productReviews.filter((r) => r.productId !== productId),
          ...action.payload,
        ]
      })
      .addCase(submitProductReview.fulfilled, (state, action) => {
        state.productReviews.push(action.payload)
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        const vendorId = action.meta.arg
        state.vendorReviews = [
          ...state.vendorReviews.filter((r) => r.vendorId !== vendorId),
          ...action.payload,
        ]
      })
      .addCase(submitVendorReview.fulfilled, (state, action) => {
        state.vendorReviews.push(action.payload)
      })
      .addMatcher(
        (action) => action.type.startsWith('catalog/') && action.type.endsWith('/rejected')
          && !action.type.startsWith('catalog/fetchProducts'),
        (state, action) => {
          console.error(`${action.type} failed:`, action.payload)
        },
      )
  },
})

export const { toggleWishlist } = catalogSlice.actions
export default catalogSlice.reducer
