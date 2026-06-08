import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  description: string;
  type: 'DEPOSIT' | 'PAYMENT';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: any;
  method: string;
}

// Kiểm tra xem đã có API Key thật chưa
const isFirebaseConfigured = () => {
  try {
    // @ts-ignore
    return db.app.options.apiKey && db.app.options.apiKey !== "YOUR_API_KEY";
  } catch (e) {
    return false;
  }
};

export const transactionService = {
  // Tạo yêu cầu nạp tiền mới
  async createDepositRequest(userId: string, amount: number, description: string) {
    console.log("Processing transaction for:", userId, amount);
    
    // Nếu chưa cấu hình Firebase, giả lập thành công sau 1 giây
    if (!isFirebaseConfigured()) {
      console.warn("Firebase not configured. Using mock data.");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("mock_doc_id_" + Date.now());
        }, 1000);
      });
    }

    try {
      const docRef = await addDoc(collection(db, "transactions"), {
        userId,
        amount,
        description,
        type: 'DEPOSIT',
        status: 'PENDING',
        method: 'VIETQR',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating deposit request: ", error);
      throw error;
    }
  },

  // Lấy lịch sử giao dịch
  async getTransactions(userId: string) {
    if (!isFirebaseConfigured()) {
      // Trả về dữ liệu mẫu nếu chưa có Firebase
      return [
        {
          id: '1',
          userId,
          amount: 500000,
          description: 'Nạp tiền mẫu (Chưa cấu hình Firebase)',
          type: 'DEPOSIT',
          status: 'SUCCESS',
          createdAt: new Date(),
          method: 'VIETQR'
        }
      ] as Transaction[];
    }

    try {
      const q = query(
        collection(db, "transactions"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      throw error;
    }
  }
};
