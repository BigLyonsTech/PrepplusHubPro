package com.prepplushub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private List<CartLineDTO> items;
    private double subtotal;
    private double discount;
    private double shipping;
    private double total;
}
