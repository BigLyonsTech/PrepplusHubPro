package com.prepplushub.dto;

import com.prepplushub.model.DeliveryAddress;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @Valid
    @NotNull(message = "Delivery address is required")
    private DeliveryAddress deliveryAddress;
}
