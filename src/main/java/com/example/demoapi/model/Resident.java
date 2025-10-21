package com.example.demoapi.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "resident")
public class Resident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer residentid;

    @ManyToOne
    @JoinColumn(name = "houseid", referencedColumnName = "houseid")
    private Apartment apartment;

    private String name;
    private String phonenumber;
    private String email;
    private LocalDate dob;
    private String state;
    private String address;
    private String cccd;

}
