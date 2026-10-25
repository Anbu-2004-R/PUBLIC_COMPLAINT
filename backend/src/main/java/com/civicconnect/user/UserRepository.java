package com.civicconnect.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmployeeId(String employeeId);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndAccountStatus(UserRole role, AccountStatus accountStatus);
    List<User> findByDepartmentIdAndRoleAndAccountStatus(String departmentId, UserRole role, AccountStatus accountStatus);

    @Query("SELECT u FROM User u WHERE u.role = 'OFFICER' AND u.accountStatus = 'ACTIVE' " +
           "AND u.departmentId = :departmentId " +
           "AND :categoryId MEMBER OF u.eligibleCategoryIds " +
           "AND :zoneId MEMBER OF u.eligibleZoneIds")
    List<User> findEligibleOfficers(
            @Param("departmentId") String departmentId,
            @Param("categoryId") String categoryId,
            @Param("zoneId") String zoneId
    );
}
