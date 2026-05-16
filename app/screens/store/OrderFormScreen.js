import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function OrderFormScreen({ route, navigation }) {
  const { cart, total } = route.params;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes,
        items: cart,
        total: total,
        status: 'pending',
        payment_method: 'COD',
      });

    if (error) {
      Alert.alert('Error', 'Could not place order. Please try again.');
      setLoading(false);
      return;
    }

    const pointsToAdd = cart.reduce((sum, i) => sum + i.qty * 100, 0);
    const { data: loyalty } = await supabase
      .from('loyalty')
      .select('points')
      .eq('id', user.id)
      .single();

    await supabase
      .from('loyalty')
      .update({ points: (loyalty?.points || 0) + pointsToAdd })
      .eq('id', user.id);

    setLoading(false);

    Alert.alert(
      '🎉 Order Placed!',
      `Thank you ${form.name}! Your order of $${total.toFixed(2)} will be delivered to ${form.city}.\n\nPayment: Cash on Delivery\n\nYou earned ${pointsToAdd} points!`,
      [{ text: 'Great!', onPress: () => navigation.navigate('MainApp') }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.map((item, i) => (
            <View key={i} style={styles.orderItem}>
              <Text style={styles.orderItemEmoji}>{item.image_emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemQty}>Qty: {item.qty}</Text>
              </View>
              <Text style={styles.orderItemPrice}>
                ${(item.price * item.qty).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.codBadge}>
            <Text style={styles.codEmoji}>💵</Text>
            <View>
              <Text style={styles.codTitle}>Cash on Delivery</Text>
              <Text style={styles.codDesc}>Pay when your order arrives</Text>
            </View>
            <Text style={styles.codCheck}>✓</Text>
          </View>
        </View>

        {/* Delivery info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#ccc"
            value={form.name}
            onChangeText={v => update('name', v)}
          />

          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="+216 XX XXX XXX"
            placeholderTextColor="#ccc"
            value={form.phone}
            onChangeText={v => update('phone', v)}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your city"
            placeholderTextColor="#ccc"
            value={form.city}
            onChangeText={v => update('city', v)}
          />

          <Text style={styles.inputLabel}>Delivery Address *</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Street, building, apartment..."
            placeholderTextColor="#ccc"
            value={form.address}
            onChangeText={v => update('address', v)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.inputLabel}>Order Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Any special instructions..."
            placeholderTextColor="#ccc"
            value={form.notes}
            onChangeText={v => update('notes', v)}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Points info */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsCardText}>
            ⭐ You'll earn {cart.reduce((s, i) => s + i.qty * 100, 0)} points with this order!
          </Text>
        </View>

        {/* Place order button */}
        <TouchableOpacity
          style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderBtnText}>
                Place Order — ${total.toFixed(2)} COD
              </Text>
          }
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  backBtn: { fontSize: 15, color: '#1D9E75', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  orderItemEmoji: { fontSize: 24 },
  orderItemName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  orderItemQty: { fontSize: 12, color: '#888', marginTop: 2 },
  orderItemPrice: { fontSize: 14, fontWeight: '700', color: '#1D9E75' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#1D9E75' },
  codBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#E1F5EE', borderRadius: 12, padding: 14 },
  codEmoji: { fontSize: 28 },
  codTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  codDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  codCheck: { marginLeft: 'auto', fontSize: 18, color: '#1D9E75', fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1a1a1a' },
  inputMultiline: { height: 80, paddingTop: 12 },
  pointsCard: { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, alignItems: 'center' },
  pointsCardText: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },
  orderBtn: { backgroundColor: '#1D9E75', paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  orderBtnDisabled: { backgroundColor: '#ccc' },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});