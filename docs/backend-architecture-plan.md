# Spring Boot + MongoDB backend plan for Oscillate

## 1. Project analysis summary

The current app is a Vite + React marketplace frontend with Redux Toolkit state and mock data. The UI already expresses a clear domain model for a real e-commerce platform:

- Authentication and onboarding flows
- Customer and vendor roles
- Product catalog browsing and detail views
- Cart and wishlist behavior
- Reviews and orders
- Vendor eligibility review
- Admin dashboard curation

The frontend currently stores most of this in Redux slices, which makes it a strong fit for a backend API that exposes the same concepts as persistent resources.

## 2. Proposed backend architecture

Use a Spring Boot 3.x application with Java 21 and MongoDB as the primary data store.

### Recommended stack
- Java 21
- Spring Boot 3.3+
- Spring Web
- Spring Data MongoDB
- Spring Validation
- Spring Security + JWT
- Lombok
- MapStruct
- OpenAPI / Swagger
- Maven or Gradle

### Suggested module structure
```text
src/main/java/com/oscillate/
  config/
  security/
  common/
  user/
  catalog/
  cart/
  order/
  review/
  admin/
  upload/
  api/
```

### Architectural style
A layered architecture works well here:
- Controllers: HTTP endpoints
- Services: business logic
- Repositories: MongoDB access
- DTOs: request/response mapping
- Domain models: persisted entities
- Security layer: auth, roles, JWT, permissions

## 3. Core domain entities to persist

### User
```json
{
  "id": "user-123",
  "name": "Ada",
  "email": "ada@example.com",
  "passwordHash": "...",
  "role": "customer",
  "onboardingStage": "active",
  "personalizationProfile": {
    "interests": ["Fashion", "Home"]
  },
  "vendorVerificationStatus": "pending",
  "vendorEligibility": {
    "businessName": "Lagos Leather Co.",
    "businessCategory": "Fashion",
    "expectedProductRange": "20-50 SKUs"
  }
}
```

### Product
```json
{
  "id": "p-1",
  "name": "Woven Raffia Tote",
  "vendorId": "v-1001",
  "price": 24500,
  "originalPrice": 30000,
  "category": "Fashion",
  "rating": 4.6,
  "reviewCount": 38,
  "description": "Hand-woven raffia tote",
  "imageUrl": "...",
  "stock": 20,
  "isFeatured": false,
  "createdAt": "2026-07-21T00:00:00Z"
}
```

### Cart
A cart is better modeled as a document per user rather than a list of unrelated rows.

```json
{
  "userId": "user-123",
  "items": [
    { "productId": "p-1", "quantity": 2 },
    { "productId": "p-2", "quantity": 1 }
  ],
  "updatedAt": "2026-07-21T00:00:00Z"
}
```

### Order
```json
{
  "id": "o-101",
  "userId": "user-123",
  "items": [
    { "productId": "p-1", "quantity": 1, "price": 24500 }
  ],
  "status": "processing",
  "subtotal": 24500,
  "shippingAddress": {},
  "paymentStatus": "pending",
  "placedAt": "2026-07-21T00:00:00Z"
}
```

### Review
```json
{
  "id": "pr-1",
  "type": "product",
  "productId": "p-1",
  "vendorId": "v-1001",
  "customerId": "user-123",
  "rating": 5,
  "comment": "Great quality",
  "createdAt": "2026-07-21T00:00:00Z"
}
```

### Admin state
```json
{
  "id": "admin-config",
  "featuredCategories": ["Electronics", "Fashion", "Home"],
  "banners": [
    { "id": "b-1", "title": "Mid-year sale", "active": true }
  ]
}
```

## 4. MongoDB collections

Suggested collections:
- users
- products
- carts
- orders
- reviews
- vendor_applications
- activity_logs
- admin_config

### Recommended indexes
- users: email unique
- products: category, vendorId, featured, name text
- orders: userId, status
- reviews: productId, vendorId
- carts: userId unique

## 5. API surface to match the current frontend

### Auth and onboarding
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-otp
- POST /api/auth/role-selection
- POST /api/auth/personalization
- POST /api/auth/vendor-eligibility

### Catalog
- GET /api/products
- GET /api/products/{id}
- GET /api/products/category/{category}
- POST /api/products (vendor/admin)
- PATCH /api/products/{id} (vendor/admin)

### Cart and wishlist
- GET /api/cart
- POST /api/cart/items
- PATCH /api/cart/items/{productId}
- DELETE /api/cart/items/{productId}
- GET /api/wishlist
- POST /api/wishlist/{productId}

### Orders and checkout
- POST /api/orders
- GET /api/orders
- GET /api/orders/{id}
- PATCH /api/orders/{id}/status

### Reviews
- GET /api/reviews/products/{productId}
- GET /api/reviews/vendors/{vendorId}
- POST /api/reviews/products
- POST /api/reviews/vendors

### Admin
- GET /api/admin/vendor-queue
- PATCH /api/admin/vendor-queue/{id}/approve
- PATCH /api/admin/vendor-queue/{id}/reject
- PATCH /api/admin/featured-categories

## 6. Recommended Spring Boot package layout

```text
com.oscillate
  ├── api
  │   ├── AuthController
  │   ├── ProductController
  │   ├── CartController
  │   ├── OrderController
  │   └── AdminController
  ├── service
  │   ├── AuthService
  │   ├── ProductService
  │   ├── CartService
  │   └── OrderService
  ├── repository
  │   ├── UserRepository
  │   ├── ProductRepository
  │   ├── CartRepository
  │   └── OrderRepository
  ├── model
  │   ├── User
  │   ├── Product
  │   ├── Cart
  │   └── Order
  ├── dto
  ├── security
  └── config
```

## 7. Frontend integration strategy

The existing React app can stay largely intact. The main change is to replace mock Redux state with API-backed state over time.

### Recommended approach
1. Keep current routes and screen structure.
2. Add API calls for auth, catalog, cart, and orders.
3. Replace local Redux initialization with fetched data from the backend.
4. Keep the UI layer mostly unchanged while moving persistence to the API.

### Good fit for the frontend
- Use Spring Boot REST APIs
- Optionally add React Query or TanStack Query later for server state management
- Keep Redux for UI state and local flow state

## 8. Suggested implementation roadmap

### Phase 1 - foundation
- Create Spring Boot project
- Add MongoDB connection
- Add JWT auth and user model
- Add basic health endpoint

### Phase 2 - core catalog and users
- Products CRUD
- Vendor onboarding and verification
- User profile and personalization

### Phase 3 - commerce flows
- Cart, wishlist, and checkout
- Orders and order status

### Phase 4 - admin and reviews
- Vendor queue approval/rejection
- Reviews and admin curation

## 9. Recommended starter dependencies

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
  <dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
  </dependency>
</dependencies>
```

## 10. Suggested MongoDB connection properties

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/oscillate
spring.data.mongodb.database=oscillate
```

## 11. Architectural recommendation

This app is a good fit for a REST API service with MongoDB because the data is document-shaped and naturally aligns with e-commerce entities such as users, products, carts, and orders. The existing UI already maps cleanly to these resources, so the backend can be introduced without redesigning the frontend experience.
