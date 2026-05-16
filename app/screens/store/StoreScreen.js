import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function StoreScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Weight Management', 'Detox', 'Digestive Health', 'Fitness', 'Immunity', 'Wellness', 'Beauty', 'Energy'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) setProducts(data);
    setLoading(false);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSelectedProduct(null);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCartVisible(false);
    navigation.navigate('OrderForm', {
      cart: cart,
      total: cartTotal,
    });
  };

  const filtered = category === 'All'
    ? products
    : products.filter(p => p.category === category);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shifa Store</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => setCartVisible(true)}
        >
          <Text style={styles.cartBtnText}>🛒 {cartCount > 0 ? cartCount : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, category === cat && styles.catBtnActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products grid */}
      <ScrollView
        style={styles.products}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => setSelectedProduct(product)}
          >
            <View style={styles.productEmoji}>
              <Text style={{ fontSize: 36 }}>{product.image_emoji}</Text>
            </View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productPrice}>${product.price}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
            >
              <Text style={styles.addBtnText}>Add to cart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Product detail modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedProduct(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {selectedProduct && (
              <>
                <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>
                  {selectedProduct.image_emoji}
                </Text>
                <Text style={styles.modalName}>{selectedProduct.name}</Text>
                <Text style={styles.modalCategory}>{selectedProduct.category}</Text>
                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                <View style={styles.modalTags}>
                  {(selectedProduct.tags || []).map((tag, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.modalFooter}>
                  <Text style={styles.modalPrice}>${selectedProduct.price}</Text>
                  <TouchableOpacity
                    style={styles.modalAddBtn}
                    onPress={() => addToCart(selectedProduct)}
                  >
                    <Text style={styles.modalAddBtnText}>Add to cart</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.pointsNote}>
                  +100 pts earned with this purchase
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Cart modal */}
      <Modal
        visible={cartVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCartVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setCartVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalName}>Your Cart</Text>
            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>Your cart is empty</Text>
            ) : (
              <>
                <ScrollView style={{ maxHeight: 300 }}>
                  {cart.map(item => (
                    <View key={item.id} style={styles.cartItem}>
                      <Text style={styles.cartItemEmoji}>{item.image_emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>
                          ${item.price} × {item.qty}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <Text style={{ color: '#ff4444', fontSize: 18 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.cartTotal}>
                  <Text style={styles.cartTotalLabel}>Total</Text>
                  <Text style={styles.cartTotalValue}>${cartTotal.toFixed(2)}</Text>
                </View>
                <Text style={styles.pointsNote}>
                  You'll earn {cart.reduce((s, i) => s + i.qty * 100, 0)} points with this order
                </Text>
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutBtnText}>Place Order</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  cartBtn: { backgroundColor: '#E1F5EE', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  cartBtnText: { fontSize: 16, color: '#1D9E75', fontWeight: '600' },
  categories: { backgroundColor: '#fff', maxHeight: 42, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f8f8f8' },
  catBtnActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  catText: { fontSize: 12, color: '#888', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  products: { flex: 1 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  productCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
  productEmoji: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  productCategory: { fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 8 },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#1D9E75', marginBottom: 12 },
  addBtn: { backgroundColor: '#1D9E75', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, width: '100%', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalClose: { alignSelf: 'flex-end', padding: 4 },
  modalCloseText: { fontSize: 18, color: '#888' },
  modalName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  modalCategory: { fontSize: 13, color: '#888', marginBottom: 12 },
  modalDesc: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 16 },
  modalTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#E1F5EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#1D9E75' },
  modalFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modalPrice: { fontSize: 24, fontWeight: '700', color: '#1D9E75' },
  modalAddBtn: { backgroundColor: '#1D9E75', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  modalAddBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  pointsNote: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 8 },
  emptyCart: { textAlign: 'center', color: '#888', marginVertical: 32, fontSize: 15 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  cartItemEmoji: { fontSize: 28 },
  cartItemName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  cartItemPrice: { fontSize: 13, color: '#888', marginTop: 2 },
  cartTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  cartTotalLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  cartTotalValue: { fontSize: 20, fontWeight: '700', color: '#1D9E75' },
  checkoutBtn: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});