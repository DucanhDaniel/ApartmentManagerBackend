package com.example.demoapi.repository;

import com.example.demoapi.model.Invoice;
import com.example.demoapi.model.RefreshToken;
import com.example.demoapi.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    boolean existsByHouseid_Houseid(Integer houseId); // Kiểm tra xem nhà này có hóa đơn nào không

    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE i.houseid.houseid = :houseId AND lower(i.status) = 'unpaid'")
    boolean existsUnpaidInvoiceByHouseId(@Param("houseId") Integer houseId);
}