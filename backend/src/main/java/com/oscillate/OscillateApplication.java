package com.oscillate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OscillateApplication {
    public static void main(String[] args) {
        SpringApplication.run(OscillateApplication.class, args);
    }
}
