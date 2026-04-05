package com.softwareproject.LinkUp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LinkUpApplication {

	public static void main(String[] args) {
		SpringApplication.run(LinkUpApplication.class, args);
	}

}
