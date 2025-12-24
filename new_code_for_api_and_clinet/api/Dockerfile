FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

# 4. Copy toàn bộ source code vào
COPY src ./src

# 5. Cấp quyền thực thi cho file gradlew
RUN chmod +x ./gradlew

# 6. Build ứng dụng (tạo file .jar) - bỏ qua test để build nhanh hơn
RUN ./gradlew bootJar --no-daemon -x test

# 7. Lệnh chạy ứng dụng khi container khởi động
# Lưu ý: Tên file jar được sinh ra thường nằm trong build/libs/
# Dòng lệnh dưới đây tự tìm file .jar trong thư mục build/libs và chạy nó
CMD ["java", "-jar", "build/libs/demo-api-0.0.1-SNAPSHOT.jar"]