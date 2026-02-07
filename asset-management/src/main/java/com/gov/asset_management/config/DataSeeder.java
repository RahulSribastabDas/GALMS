package com.gov.asset_management.config;

import com.gov.asset_management.model.Role; // <--- Critical Import
import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepo) {
        return args -> {
            // 1. Create Procurement Officer (Amit)
            if (userRepo.findByUsername("amit_po").isEmpty()) {
                User amit = new User();
                amit.setUsername("amit_po");
                amit.setPassword("123456");
                // FIXED: Using Enum constant instead of String
                amit.setRole(Role.PROCUREMENT_OFFICER);
                amit.setDepartmentName("Procurement Cell");
                amit.setIsActive(true);
                userRepo.save(amit);
                System.out.println("✅ Created User: amit_po");
            }

            // 2. Create Dept Head (Priya)
            if (userRepo.findByUsername("priya_head").isEmpty()) {
                User priya = new User();
                priya.setUsername("priya_head");
                priya.setPassword("123456");
                // FIXED: Using Enum constant
                priya.setRole(Role.DEPT_HEAD);
                priya.setDepartmentName("General Administration");
                priya.setIsActive(true);
                userRepo.save(priya);
                System.out.println("✅ Created User: priya_head");
            }

            // 3. Create Employee (Rahul)
            if (userRepo.findByUsername("rahul").isEmpty()) {
                User rahul = new User();
                rahul.setUsername("rahul");
                rahul.setPassword("1234");
                // FIXED: Using Enum constant
                rahul.setRole(Role.EMPLOYEE);
                rahul.setDepartmentName("IT Dept");
                rahul.setIsActive(true);
                userRepo.save(rahul);
                System.out.println("✅ Created User: rahul");
            }
        };
    }
}