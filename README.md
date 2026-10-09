# BÀI KIỂM TRA THỰC HÀNH 2 (TH2) - KTXGO

- **Họ và tên**: VO HIEU TRANG KIEN
- **MSSV**: 23710971
- **URL Clone HTTPS**: https://github.com/vohieutrangkien/23710971_TH2.git
- **Mã Stamp**: #880084
- **Số cuối MSSV**: 1
- **Hàng VARIANT**:
  - `watermarkAtTop`: `false` (Dưới)
  - `authField`: `'phone'` (Ô nhập số điện thoại)
  - `tabOrder`: `'shopFirst'` (Shop trước: Cửa hàng → Giỏ → Tôi)
  - `hapticOnAdd`: `'selection'` (Haptic selection)
  - `shipFormula`: `'B'` (Phí = BASE_SHIP_FEE + round(km \* 1500) + 2000)
  - `detailPresentation`: `'card'`

---

## Cấu trúc thư mục & Công nghệ sử dụng

- **React Native CLI** + **TypeScript**
- **React Navigation v7**: AuthStack + MainTabs + ShopStack
- **FlashList**: Hiển thị lưới 2 cột sản phẩm với `keyExtractor` gắn MSSV `23710971`
- **Zustand + Persist**: Lưu giỏ hàng bền vững với AsyncStorage `ktxgo-cart-23710971`
- **TanStack Query + Axios**: Fetch dữ liệu món ăn, caching với `STALE_TIME_MS`, interceptor `X-Student-Id`
- **Native Permissions & Haversine**: Xin quyền vị trí, tính khoảng cách GPS đến điểm KTX giả lập, xử lý mở Cài đặt khi bị `blocked`.

## Ảnh chụp minh hoạ

- `docs/screenshot-th2-home.png`
- `docs/screenshot-th2-cart.png`
