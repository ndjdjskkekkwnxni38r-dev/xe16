export const MART_CATEGORIES = [
  {
    id: "all",
    name: "Tất cả",
    image: "https://cdn-icons-png.flaticon.com/512/3724/3724720.png",
  },
  {
    id: "1",
    name: "Siêu thị",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081918.png",
  },
  {
    id: "2",
    name: "Trái cây",
    image: "https://cdn-icons-png.flaticon.com/512/3194/3194591.png",
  },
  {
    id: "3",
    name: "Thực phẩm",
    image: "https://cdn-icons-png.flaticon.com/512/2722/2722527.png",
  },
  {
    id: "4",
    name: "Hóa mỹ phẩm",
    image: "https://cdn-icons-png.flaticon.com/512/3167/3167845.png",
  },
  {
    id: "5",
    name: "Sữa & Tã",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081037.png",
  },
  {
    id: "6",
    name: "Tiệm thuốc",
    image: "https://cdn-icons-png.flaticon.com/512/883/883356.png",
  },
];

export const STORES = [
  {
    id: "s1",
    categoryId: "1",
    name: "WinMart+ - Nguyễn Văn Linh",
    image:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop",
    rating: 4.7,
    reviews: 2100,
    distance: "0.5 km",
    time: "15-25 phút",
    tags: ["Siêu thị", "Tiện lợi", "Hàng tươi sống"],
    isPromo: true,
    promoText: "Giảm 15%",
    menu: [
      {
        id: "p1",
        name: "Trứng gà CP (Hộp 10 quả)",
        price: 32000,
        desc: "Trứng gà sạch, đảm bảo vệ sinh an toàn thực phẩm.",
        image:
          "https://vcdn1-kinhdoanh.vnecdn.net/2021/07/15/trung-ga-1626343515-1626343525-4672-1626343542.jpg",
        isBestSeller: true,
      },
      {
        id: "p2",
        name: "Sữa tươi TH True Milk (1L)",
        price: 38000,
        desc: "Sữa tươi tiệt trùng nguyên chất.",
        image:
          "https://cdn.tgdd.vn/Products/Images/2386/161404/bhx/sua-tuoi-tiet-trung-th-true-milk-nguyen-chat-hop-1-lit-202306021430467727.jpg",
      },
    ],
  },
  {
    id: "s2",
    categoryId: "2",
    name: "Klever Fruit - Lê Duẩn",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
    rating: 4.9,
    reviews: 850,
    distance: "1.2 km",
    time: "20-30 phút",
    tags: ["Trái cây", "Nhập khẩu", "Quà tặng"],
    isPromo: false,
    menu: [
      {
        id: "p3",
        name: "Táo Envy Mỹ (Size lớn)",
        price: 185000,
        desc: "Táo giòn, ngọt đậm đà, hương thơm đặc trưng.",
        image:
          "https://kleverfruits.com.vn/vnt_upload/product/12_2019/tao-envy-size-large-1_1.jpg",
        isBestSeller: true,
      },
      {
        id: "p4",
        name: "Nho Mẫu Đơn Hàn Quốc",
        price: 650000,
        desc: "Nho không hạt, vị ngọt lịm như kẹo.",
        image:
          "https://kleverfruits.com.vn/vnt_upload/product/10_2020/nho-mau-don-han-quoc-1.jpg",
      },
    ],
  },
  {
    id: "s3",
    categoryId: "6",
    name: "Nhà Thuốc Long Châu - Ông Ích Khiêm",
    image:
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviews: 5400,
    distance: "0.8 km",
    time: "10-20 phút",
    tags: ["Dược phẩm", "Thực phẩm chức năng", "Chăm sóc cá nhân"],
    isPromo: true,
    promoText: "Freeship",
    menu: [
      {
        id: "p5",
        name: "Khẩu trang 3D Mask (Hộp 50 cái)",
        price: 55000,
        desc: "Khẩu trang kháng khuẩn, thiết kế ôm sát.",
        image:
          "https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/00021669_khau_trang_y_te_3d_mask_mon_mon_hop_50_cai_9918_628d_large_e92750e504.jpg",
        isBestSeller: true,
      },
    ],
  },
];

export const TRENDING_PRODUCTS = [
  {
    id: "tp1",
    name: "Bắp Cải Trắng Đà Lạt",
    price: 15000,
    image:
      "https://vinid.net/wp-content/uploads/2020/04/20200427_Cach-chon-bap-cai-ngon-1.jpg",
    storeName: "WinMart+",
  },
  {
    id: "tp2",
    name: "Thịt Ba Chỉ Heo (500g)",
    price: 85000,
    image:
      "https://thucphamhuunghi.com/wp-content/uploads/2020/12/thit-ba-roi-rut-suon-2.jpg",
    storeName: "CP Fresh",
  },
  {
    id: "tp3",
    name: "Cam Sành Tiền Giang",
    price: 25000,
    image:
      "https://product.hstatic.net/1000301451/product/cam_sanh_89a03975059d43528b3f2f8111e1378d_master.jpg",
    storeName: "Klever Fruit",
  },
  {
    id: "tp4",
    name: "Mì Hảo Hảo Tôm Chua Cay",
    price: 4500,
    image:
      "https://cdn.tgdd.vn/Products/Images/2565/76412/bhx/mi-hao-hao-tom-chua-cay-goi-75g-202308101416568285.jpg",
    storeName: "WinMart+",
  },
  {
    id: "tp5",
    name: "Dầu Ăn Neptune (1L)",
    price: 52000,
    image:
      "https://cdn.tgdd.vn/Products/Images/2241/76140/bhx/dau-an-neptune-light-chai-1-lit-202311091535213617.jpg",
    storeName: "Lotte Mart",
  },
  {
    id: "tp6",
    name: "Cá Hồi Phi Lê (200g)",
    price: 145000,
    image:
      "https://file.hstatic.net/1000109913/article/phi_le_ca_hoi_la_gi__an_ca_hoi_phi_le_co_tot_khong__7176d6396f924151b73f8b898f82877a.jpg",
    storeName: "Đảo Hải Sản",
  },
];

export const DANANG_SPOTS = [
  {
    id: "1",
    categoryId: "popular",
    name: "Bà Nà Hills",
    desc: "Đường lên tiên cảnh với Cầu Vàng nổi tiếng thế giới.",
    image: "https://media.cntraveler.com/photos/5b63050a4d04845a98bf6b22/16:9/w_2560%2Cc_limit/Golden-Bridge-Vietnam_GettyImages-1002368736.jpg",
    images: [
      "https://media.cntraveler.com/photos/5b63050a4d04845a98bf6b22/16:9/w_2560%2Cc_limit/Golden-Bridge-Vietnam_GettyImages-1002368736.jpg",
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000",
      "https://images.unsplash.com/photo-1563223772-29a3afac2138?q=80&w=1000",
      "https://images.unsplash.com/photo-1582296459388-75502758126b?q=80&w=1000"
    ],
    price: "900.000đ",
    content: "Sun World Ba Na Hills là quần thể du lịch nghỉ dưỡng kết hợp vui chơi giải trí hàng đầu Việt Nam...",
    location: "Hòa Vang, Đà Nẵng",
    lat: 15.9951,
    lng: 107.9961,
  },
  {
    id: "2",
    categoryId: "popular",
    name: "Phố Cổ Hội An",
    desc: "Vẻ đẹp hoài cổ lung linh bên dòng sông Hoài.",
    image: "https://images.unsplash.com/photo-1559592410-b964344cbcc6?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1559592410-b964344cbcc6?q=80&w=1000",
      "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000",
      "https://images.unsplash.com/photo-1581458925585-64de855683dd?q=80&w=1000",
      "https://images.unsplash.com/photo-1579294246376-7880d603a116?q=80&w=1000",
      "https://images.unsplash.com/photo-1563236041-0164c6778f69?q=80&w=1000"
    ],
    price: "450.000đ",
    content: "Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn...",
    location: "Hội An, Quảng Nam",
    lat: 15.8801,
    lng: 108.3384,
  },
  {
    id: "3",
    categoryId: "nature",
    name: "Bán đảo Sơn Trà",
    desc: "Lá phổi xanh của thành phố với chùa Linh Ứng đại thụ.",
    image: "https://images.unsplash.com/photo-1605652514331-50e50f55cdfc?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1605652514331-50e50f55cdfc?q=80&w=1000",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000",
      "https://images.unsplash.com/photo-1560377038-f90b8f047709?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000",
      "https://images.unsplash.com/photo-1583417537679-b223d6a69c09?q=80&w=1000"
    ],
    price: "Miễn phí",
    content: "Bán đảo Sơn Trà là khu bảo tồn thiên nhiên đa dạng với hệ sinh thái phong phú...",
    location: "Sơn Trà, Đà Nẵng",
    lat: 16.1214,
    lng: 108.2782,
  },
  {
    id: "4",
    categoryId: "nature",
    name: "Ngũ Hành Sơn",
    desc: "Cụm 5 ngọn núi đá vôi kỳ vĩ với hệ thống hang động huyền ảo.",
    image: "https://images.unsplash.com/photo-1570783457916-2a74c2bc54e2?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1570783457916-2a74c2bc54e2?q=80&w=1000",
      "https://images.unsplash.com/photo-1555546255-70331006fc4b?q=80&w=1000",
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000",
      "https://images.unsplash.com/photo-1583417646658-45091cbaebbb?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000"
    ],
    price: "40.000đ",
    content: "Ngũ Hành Sơn là một thắng cảnh nổi tiếng tại Đà Nẵng, bao gồm Kim, Mộc, Thủy, Hỏa, Thổ...",
    location: "Ngũ Hành Sơn, Đà Nẵng",
    lat: 16.0031,
    lng: 108.2639,
  },
  {
    id: "5",
    categoryId: "popular",
    name: "Cầu Rồng",
    desc: "Biểu tượng hiện đại với màn trình diễn phun lửa và nước cuối tuần.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Dragon_Bridge_%28C%E1%BA%A7u_R%E1%BB%93ng%29%2C_Da_Nang%2C_Vietnam.jpg/1200px-Dragon_Bridge_%28C%E1%BA%A7u_R%E1%BB%93ng%29%2C_Da_Nang%2C_Vietnam.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Dragon_Bridge_%28C%E1%BA%A7u_R%E1%BB%93ng%29%2C_Da_Nang%2C_Vietnam.jpg/1200px-Dragon_Bridge_%28C%E1%BA%A7u_R%E1%BB%93ng%29%2C_Da_Nang%2C_Vietnam.jpg",
      "https://images.unsplash.com/photo-1555546255-70331006fc4b?q=80&w=1000",
      "https://images.unsplash.com/photo-1583417537679-b223d6a69c09?q=80&w=1000",
      "https://images.unsplash.com/photo-1570783457916-2a74c2bc54e2?q=80&w=1000",
      "https://images.unsplash.com/photo-1560377038-f90b8f047709?q=80&w=1000"
    ],
    price: "Miễn phí",
    content: "Cầu Rồng là cây cầu biểu tượng của Đà Nẵng với kiến trúc độc đáo hình con rồng thời Lý...",
    location: "Hải Châu, Đà Nẵng",
    lat: 16.0611,
    lng: 108.2274,
  },
  {
    id: "6",
    categoryId: "nature",
    name: "Biển Mỹ Khê",
    desc: "Một trong 6 bãi biển quyến rũ nhất hành tinh do tạp chí Forbes bình chọn.",
    image: "https://vcdn1-dulich.vnecdn.net/2022/06/03/mykhe-1654247501-8515-1654247656.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=55lq17D-_K9Ew9v_aYfD3A",
    images: [
      "https://vcdn1-dulich.vnecdn.net/2022/06/03/mykhe-1654247501-8515-1654247656.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=55lq17D-_K9Ew9v_aYfD3A",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000",
      "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?q=80&w=1000",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000"
    ],
    price: "Miễn phí",
    content: "Biển Mỹ Khê nổi tiếng with bãi cát trắng mịn, sóng biển ôn hòa và nước ấm quanh năm...",
    location: "Sơn Trà, Đà Nẵng",
    lat: 16.0651,
    lng: 108.2471,
  },
  {
    id: "7",
    categoryId: "popular",
    name: "Bảo tàng Chăm",
    desc: "Nơi lưu giữ những tinh hoa văn hóa Chăm-pa cổ xưa đặc sắc.",
    image: "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592410-b964344cbcc6?q=80&w=1000",
      "https://images.unsplash.com/photo-1581458925585-64de855683dd?q=80&w=1000",
      "https://images.unsplash.com/photo-1579294246376-7880d603a116?q=80&w=1000",
      "https://images.unsplash.com/photo-1563236041-0164c6778f69?q=80&w=1000"
    ],
    price: "60.000đ",
    content: "Bảo tàng Điêu khắc Chăm là nơi trưng bày quy mô nhất các tác phẩm điêu khắc Chăm-pa trên thế giới...",
    location: "Hải Châu, Đà Nẵng",
    lat: 16.0614,
    lng: 108.2224,
  },
  {
    id: "8",
    categoryId: "popular",
    name: "Asia Park - Sun World",
    desc: "Tổ hợp vui chơi giải trí đẳng cấp quốc tế với vòng quay mặt trời Sun Wheel.",
    image: "https://images.unsplash.com/photo-1513828742140-ccaa28f3eda0?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1513828742140-ccaa28f3eda0?q=80&w=1000",
      "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=1000",
      "https://images.unsplash.com/photo-1522083115900-1c3f56fcc0f6?q=80&w=1000",
      "https://images.unsplash.com/photo-1549556272-358021c54e17?q=80&w=1000",
      "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000"
    ],
    price: "200.000đ",
    content: "Công viên Châu Á - Asia Park mang đến hàng loạt trò chơi cảm giác mạnh và không gian văn hóa đặc sắc...",
    location: "Hải Châu, Đà Nẵng",
    lat: 16.0401,
    lng: 108.2264,
  },
  {
    id: "9",
    categoryId: "nature",
    name: "Núi Thần Tài",
    desc: "Công viên suối khoáng nóng với nhiều hoạt động thư giãn và vui chơi dưới nước.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000",
      "https://images.unsplash.com/photo-1605652514331-50e50f55cdfc?q=80&w=1000",
      "https://images.unsplash.com/photo-1570783457916-2a74c2bc54e2?q=80&w=1000",
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000",
      "https://images.unsplash.com/photo-1555546255-70331006fc4b?q=80&w=1000"
    ],
    price: "450.000đ",
    content: "Công viên suối khoáng nóng Núi Thần Tài là điểm đến lý tưởng để nghỉ dưỡng và chăm sóc sức khỏe...",
    location: "Hòa Vang, Đà Nẵng",
    lat: 15.9791,
    lng: 107.9814,
  },
  {
    id: "10",
    categoryId: "nature",
    name: "Đèo Hải Vân",
    desc: "Thiên hạ đệ nhất hùng quan với cung đường uốn lượn bên bờ biển xanh ngắt.",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000",
      "https://images.unsplash.com/photo-1560377038-f90b8f047709?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592442-7e182c9bd740?q=80&w=1000",
      "https://images.unsplash.com/photo-1583417537679-b223d6a69c09?q=80&w=1000"
    ],
    price: "Miễn phí",
    content: "Đèo Hải Vân là một trong những cung đường đèo ven biển đẹp nhất thế giới, nối liền Đà Nẵng và Huế...",
    location: "Liên Chiểu, Đà Nẵng",
    lat: 16.1874,
    lng: 108.1311,
  },
  {
    id: "11",
    categoryId: "popular",
    name: "Chợ Hàn",
    desc: "Ngôi chợ truyền thống sầm uất nhất Đà Nẵng với đủ loại đặc sản và quà lưu niệm.",
    image: "https://images.unsplash.com/photo-1581458925585-64de855683dd?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1581458925585-64de855683dd?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592410-b964344cbcc6?q=80&w=1000",
      "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000",
      "https://images.unsplash.com/photo-1579294246376-7880d603a116?q=80&w=1000",
      "https://images.unsplash.com/photo-1563236041-0164c6778f69?q=80&w=1000"
    ],
    price: "Miễn phí",
    content: "Chợ Hàn là trung tâm mua sắm lâu đời, nơi bạn có thể tìm thấy mọi đặc sản của miền Trung...",
    location: "Hải Châu, Đà Nẵng",
    lat: 16.0684,
    lng: 108.2241,
  },
  {
    id: "12",
    categoryId: "nature",
    name: "Rừng dừa Bảy Mẫu",
    desc: "Trải nghiệm chèo thúng chai thú vị giữa rừng dừa nước xanh mát như miền Tây.",
    image: "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1534062423-cb459ffdc3f1?q=80&w=1000",
      "https://images.unsplash.com/photo-1559592410-b964344cbcc6?q=80&w=1000",
      "https://images.unsplash.com/photo-1581458925585-64de855683dd?q=80&w=1000",
      "https://images.unsplash.com/photo-1579294246376-7880d603a116?q=80&w=1000",
      "https://images.unsplash.com/photo-1563236041-0164c6778f69?q=80&w=1000"
    ],
    price: "150.000đ",
    content: "Rừng dừa Bảy Mẫu mang đến cho du khách cơ hội khám phá hệ sinh thái vùng ngập mặn bằng thúng chai...",
    location: "Cẩm Thanh, Hội An",
    lat: 15.8741,
    lng: 108.3654,
  },
];

export const PROMOTIONS = [
  {
    id: "p1",
    title: "Giảm 50k đặt xe 16 chỗ",
    subtitle: "Áp dụng cho chuyến đi từ 200k",
    code: "VAN50K",
    expiry: "Hết hạn trong 3 ngày",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
    color: "#00B14F",
    type: "Di chuyển",
  },
  {
    id: "p2",
    title: "Giảm 30% Đặt Đồ Ăn",
    subtitle: "Tối đa 30k cho đơn hàng từ 100k",
    code: "FOOD30",
    expiry: "Hết hạn trong 5 ngày",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
    color: "#F43F5E",
    type: "Đồ ăn",
  },
  {
    id: "p3",
    title: "Miễn Phí Giao Hàng",
    subtitle: "Cho đơn hàng đầu tiên trong bán kính 5km",
    code: "FREESHIP",
    expiry: "Hết hạn trong 7 ngày",
    image:
      "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1000&auto=format&fit=crop",
    color: "#8B5CF6",
    type: "Giao hàng",
  },
  {
    id: "p4",
    title: "Ưu Đãi Khách Sạn 20%",
    subtitle: "Giảm đến 200k khi đặt phòng qua VanBooking",
    code: "STAY20",
    expiry: "Hết hạn trong 15 ngày",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    color: "#EC4899",
    type: "Khách sạn",
  },
  {
    id: "p5",
    title: "Giảm 10% Vé Tham Quan",
    subtitle: "Áp dụng cho tất cả điểm đến tại Đà Nẵng",
    code: "TRIP10",
    expiry: "Hết hạn trong 10 ngày",
    image:
      "https://images.unsplash.com/photo-1558948487-73b30d31988a?q=80&w=1000&auto=format&fit=crop",
    color: "#10B981",
    type: "Tham quan",
  },
  {
    id: "p6",
    title: "Thưởng 15% Nạp Tiền",
    subtitle: "Tặng thêm 15% giá trị khi nạp lần đầu trên 500k",
    code: "FIRSTDEPOSIT",
    expiry: "Vĩnh viễn cho lần nạp đầu",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop",
    color: "#F59E0B",
    type: "Ví tiền",
  },
];

export const FOOD_CATEGORIES = [
  {
    id: "all",
    name: "Tất cả",
    image: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
  },
  {
    id: "1",
    name: "Cơm",
    image: "https://cdn-icons-png.flaticon.com/512/3174/3174880.png",
  },
  {
    id: "2",
    name: "Bún/Phở",
    image: "https://cdn-icons-png.flaticon.com/512/3480/3480618.png",
  },
  {
    id: "3",
    name: "Trà sữa",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081162.png",
  },
  {
    id: "4",
    name: "Ăn vặt",
    image: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png",
  },
  {
    id: "5",
    name: "Gà rán",
    image: "https://cdn-icons-png.flaticon.com/512/3143/3143640.png",
  },
  {
    id: "6",
    name: "Pizza",
    image: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png",
  },
  {
    id: "7",
    name: "Hải sản",
    image: "https://cdn-icons-png.flaticon.com/512/2321/2321380.png",
  },
  {
    id: "8",
    name: "Healthy",
    image: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
  },
];

export const RESTAURANTS = [
  {
    id: "r1",
    categoryId: "1",
    name: "Cơm Gà Bà Buội - Đặc Sản Hội An",
    image:
      "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviews: 1200,
    distance: "1.2 km",
    time: "15-20 phút",
    tags: ["Cơm gà", "Đặc sản", "Hội An"],
    isPromo: true,
    promoText: "Giảm 20%",
    menu: [
      {
        id: "m1",
        name: "Cơm Gà Xé Signature",
        price: 45000,
        desc: "Gà ta thả vườn xé phay, cơm nấu nước dùng gà thơm dẻo.",
        image: "https://statics.vinpearl.com/com-ga-hoi-an-1_1628153111.jpg",
        isBestSeller: true,
      },
      {
        id: "m2",
        name: "Cơm Gà Đùi Quay",
        price: 65000,
        desc: "Đùi gà chiên giòn tan, ăn kèm đồ chua đặc trưng.",
        image:
          "https://cdn.tgdd.vn/Files/2021/07/07/1366215/cach-lam-com-ga-xe-hoi-an-thom-ngon-chuan-vi-don-gian-tai-nha-202107071336311144.jpg",
      },
      {
        id: "m3",
        name: "Lòng Gà Xào Mướp",
        price: 35000,
        desc: "Món phụ cực đưa cơm cho ngày nắng.",
        image: "https://statics.vinpearl.com/com-ga-hoi-an-4_1628153215.jpg",
      },
    ],
  },
  {
    id: "r2",
    categoryId: "3",
    name: "The Alley - Nguyễn Văn Linh",
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000&auto=format&fit=crop",
    rating: 4.5,
    reviews: 850,
    distance: "0.8 km",
    time: "10-15 phút",
    tags: ["Trà sữa", "Đồ uống", "Trân châu"],
    isPromo: false,
    menu: [
      {
        id: "m4",
        name: "Sữa Tươi Trân Châu Đường Đen",
        price: 65000,
        desc: "Vị sữa béo ngậy quyện cùng đường đen thủ công.",
        image:
          "https://vcdn1-du-lich.vnecdn.net/2022/01/21/sua-tuoi-tran-chau-duong-den-1642755444.jpg",
        isBestSeller: true,
      },
      {
        id: "m5",
        name: "Trà Sữa Khoai Môn",
        price: 55000,
        desc: "Khoai môn tươi xay nhuyễn, vị ngọt thanh.",
        image:
          "https://douongngon.com/wp-content/uploads/2020/06/tra-sua-khoai-mon.jpg",
      },
    ],
  },
  {
    id: "r3",
    categoryId: "7",
    name: "Hải Sản Năm Đảnh - Trần Quang Khải",
    image:
      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?q=80&w=1000&auto=format&fit=crop",
    rating: 4.7,
    reviews: 3500,
    distance: "4.5 km",
    time: "30-45 phút",
    tags: ["Hải sản", "Đồng giá", "Tươi sống"],
    isPromo: true,
    promoText: "Freeship",
    menu: [
      {
        id: "m6",
        name: "Chip Chip Hấp Sả",
        price: 60000,
        desc: "Hải sản tươi sống hấp sả ớt cay nồng.",
        image: "https://statics.vinpearl.com/hai-san-da-nang-1_1628151234.jpg",
        isBestSeller: true,
      },
      {
        id: "m7",
        name: "Ghẹ Rang Me",
        price: 120000,
        desc: "Ghẹ tươi chắc thịt xào sốt me chua ngọt.",
        image: "https://statics.vinpearl.com/hai-san-da-nang-3_1628151256.jpg",
      },
    ],
  },
  {
    id: "r4",
    categoryId: "6",
    name: "Pizza 4P’s - Hoàn Mỹ Style",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",
    rating: 4.9,
    reviews: 5000,
    distance: "3.0 km",
    time: "25-35 phút",
    tags: ["Pizza", "Ý", "Lãng mạn"],
    isPromo: false,
    menu: [
      {
        id: "m8",
        name: "Pizza 4 Cheese Signature",
        price: 250000,
        desc: "4 loại phô mai cao cấp hòa quyện tuyệt vời.",
        image: "https://order.pizza4ps.com/images/menu/4-cheese-pizza.jpg",
        isBestSeller: true,
      },
      {
        id: "m9",
        name: "Pasta Carbonara",
        price: 150000,
        desc: "Mỳ Ý sốt kem trứng và thịt xông khói giòn.",
        image: "https://order.pizza4ps.com/images/menu/pasta-carbonara.jpg",
      },
    ],
  },
  {
    id: "r5",
    categoryId: "8",
    name: "Healthy Corner - Eat Clean",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
    rating: 4.6,
    reviews: 420,
    distance: "1.5 km",
    time: "20-25 phút",
    tags: ["Salad", "Healthy", "Eat clean"],
    isPromo: true,
    promoText: "Tặng nước",
    menu: [
      {
        id: "m10",
        name: "Salad Ức Gà Áp Chảo",
        price: 75000,
        desc: "Ức gà mềm, rau củ hữu cơ và sốt mè rang.",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
        isBestSeller: true,
      },
      {
        id: "m11",
        name: "Poke Bát Cẩm Tú",
        price: 95000,
        desc: "Cá hồi tươi, quả bơ, gạo lứt và các loại hạt.",
        image:
          "https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=1000&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "r6",
    categoryId: "5",
    name: "Popeyes - Lê Duẩn",
    image:
      "https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=1000&auto=format&fit=crop",
    rating: 4.4,
    reviews: 1500,
    distance: "2.2 km",
    time: "15-20 phút",
    tags: ["Gà rán", "Mỹ", "Cay nồng"],
    isPromo: true,
    promoText: "Mua 1 tặng 1",
    menu: [
      {
        id: "m12",
        name: "Combo Gà Tắm Nước Mắm",
        price: 99000,
        desc: "2 miếng gà giòn, khoai tây chiên và nước ngọt.",
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1000&auto=format&fit=crop",
        isBestSeller: true,
      },
    ],
  },
];

export type PlaceSuggestion = {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
};

/** Điểm đến phổ biến — gợi ý nhanh trong màn đặt xe */
export const POPULAR_DESTINATIONS: PlaceSuggestion[] = [
  {
    place_id: 'popular-1',
    description: 'Sân bay Quốc tế Đà Nẵng, Hải Châu, Đà Nẵng',
    structured_formatting: { main_text: 'Sân bay Quốc tế Đà Nẵng', secondary_text: 'Hải Châu, Đà Nẵng' },
  },
  {
    place_id: 'popular-2',
    description: 'Bãi biển Mỹ Khê, Sơn Trà, Đà Nẵng',
    structured_formatting: { main_text: 'Bãi biển Mỹ Khê', secondary_text: 'Sơn Trà, Đà Nẵng' },
  },
  {
    place_id: 'popular-3',
    description: 'Phố cổ Hội An, Quảng Nam',
    structured_formatting: { main_text: 'Phố cổ Hội An', secondary_text: 'Quảng Nam' },
  },
  {
    place_id: 'popular-4',
    description: 'Bà Nà Hills, Hòa Vang, Đà Nẵng',
    structured_formatting: { main_text: 'Bà Nà Hills', secondary_text: 'Hòa Vang, Đà Nẵng' },
  },
  {
    place_id: 'popular-5',
    description: 'Ngũ Hành Sơn, Đà Nẵng',
    structured_formatting: { main_text: 'Ngũ Hành Sơn', secondary_text: 'Đà Nẵng' },
  },
  {
    place_id: 'popular-6',
    description: 'Chùa Linh Ứng, Bán đảo Sơn Trà, Đà Nẵng',
    structured_formatting: { main_text: 'Chùa Linh Ứng', secondary_text: 'Bán đảo Sơn Trà, Đà Nẵng' },
  },
  {
    place_id: 'popular-7',
    description: 'Cầu Rồng, Hải Châu, Đà Nẵng',
    structured_formatting: { main_text: 'Cầu Rồng', secondary_text: 'Hải Châu, Đà Nẵng' },
  },
  {
    place_id: 'popular-8',
    description: 'VinWonders Nam Hội An, Bình Minh, Thăng Bình, Quảng Nam',
    structured_formatting: { main_text: 'VinWonders Nam Hội An', secondary_text: 'Bình Minh, Thăng Bình, Quảng Nam' },
  },
  {
    place_id: 'popular-9',
    description: 'Đèo Hải Vân, Hòa Hiệp Bắc, Liên Chiểu, Đà Nẵng',
    structured_formatting: { main_text: 'Đèo Hải Vân', secondary_text: 'Liên Chiểu, Đà Nẵng' },
  },
];
