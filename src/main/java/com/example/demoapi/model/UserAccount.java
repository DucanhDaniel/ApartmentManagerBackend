package com.example.demoapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "useraccount")
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer accountid;

    private String username;
    private String password; // Will be encrypted
    private String role;     // "ADMIN" or "RESIDENT"

    @OneToOne
    @JoinColumn(name = "residentid", referencedColumnName = "residentid")
    private Resident resident;
}