package com.prepplushub.config;

import com.prepplushub.model.Product;
import com.prepplushub.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() > 0) {
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            List<Product> products = List.of(
                    product("Woven Raffia Tote", "Lagos Leather Co.", "v-1001", 24500, null, "Fashion",
                            4.6, 38, "Hand-woven raffia tote with a leather-trimmed strap. Made in small batches.",
                            null, false, now),
                    product("Noise-Isolating Earbuds", "Everstock Electronics", "v-1002", 38900, 54900.0, "Electronics",
                            4.3, 112, "30-hour battery life, USB-C fast charge, IPX5 water resistance.",
                            null, true, now),
                    product("Ceramic Pour-Over Set", "Kiln & Co.", "v-1003", 15900, null, "Home",
                            4.8, 61, "Hand-thrown ceramic dripper and matching carafe, 500ml capacity.",
                            "sample", false, now),
                    product("Shea & Oat Body Cream", "Bare Botanicals", "v-1004", 8500, 12000.0, "Beauty",
                            4.7, 204, "Whipped shea butter with colloidal oat, fragrance-free, for sensitive skin.",
                            null, true, now),
                    product("Everyday Canvas Sneakers", "Field & Form", "v-1005", 21000, 28000.0, "Fashion",
                            4.4, 87, "Low-top canvas sneakers with a recycled-rubber sole. True to size.",
                            null, true, now),
                    product("Mechanical Keyboard — 65%", "Everstock Electronics", "v-1002", 54000, null, "Electronics",
                            4.5, 76, "Hot-swappable switches, PBT keycaps, USB-C detachable cable.",
                            null, false, now),
                    product("Linen Table Runner", "Kiln & Co.", "v-1003", 9200, null, "Home",
                            4.9, 29, "Stonewashed linen, 180cm, machine washable.",
                            null, false, now),
                    product("Trail-Ready Backpack 22L", "Field & Form", "v-1005", 32500, 41000.0, "Sports",
                            4.5, 54, "Weatherproof shell, padded laptop sleeve, side water-bottle pockets.",
                            null, true, now),
                    product("Classic Pullover Hoodie — Sand", "Field & Form", "v-1005", 19500, null, "Fashion",
                            4.7, 44, "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.",
                            null, false, now),
                    product("Classic Pullover Hoodie — Burgundy", "Field & Form", "v-1005", 19500, 24000.0, "Fashion",
                            4.8, 61, "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.",
                            null, true, now),
                    product("Classic Pullover Hoodie — White", "Field & Form", "v-1005", 19500, null, "Fashion",
                            4.6, 29, "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.",
                            null, false, now),
                    product("Classic Pullover Hoodie — Sky Blue", "Field & Form", "v-1005", 19500, null, "Fashion",
                            4.7, 33, "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.",
                            null, false, now)
            );

            productRepository.saveAll(products);
        };
    }

    private Product product(String name, String vendor, String vendorId, double price, Double originalPrice,
                             String category, double rating, int reviewCount, String description, String image,
                             boolean featured, LocalDateTime now) {
        Product product = new Product();
        product.setName(name);
        product.setVendor(vendor);
        product.setVendorId(vendorId);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setCategory(category);
        product.setRating(rating);
        product.setReviewCount(reviewCount);
        product.setDescription(description);
        product.setImage(image);
        product.setFeatured(featured);
        product.setActive(true);
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        return product;
    }
}
