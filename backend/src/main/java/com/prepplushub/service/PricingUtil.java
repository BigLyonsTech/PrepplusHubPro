package com.prepplushub.service;

public final class PricingUtil {

    private static final double FREE_SHIPPING_THRESHOLD = 50000;
    private static final double FLAT_SHIPPING_FEE = 2500;

    private PricingUtil() {
    }

    public static double shippingFor(double subtotal) {
        if (subtotal == 0 || subtotal > FREE_SHIPPING_THRESHOLD) {
            return 0;
        }
        return FLAT_SHIPPING_FEE;
    }
}
