package com.oscillate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartLineDTO {
    private String productId;
    private String name;
    private String image;
    private String category;
    private double price;
    private Double originalPrice;
    private int quantity;
}
