import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import {
  SavedPaymentMethod,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "../utils/storage";

type MethodType = SavedPaymentMethod["type"];

const METHOD_META: Record<MethodType, { icon: string; label: string }> = {
  card: { icon: "card-outline", label: "Card" },
  mobile_money: { icon: "phone-portrait-outline", label: "Mobile Money" },
  apple_pay: { icon: "logo-apple", label: "Apple Pay" },
  paypal: { icon: "logo-paypal", label: "PayPal" },
};

const MOBILE_PROVIDERS = ["MTN MoMo", "Airtel Money", "MPesa"];

function generateId(): string {
  return `pm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<SavedPaymentMethod | null>(null);

  // Add/edit form state
  const [editingMethod, setEditingMethod] =
    useState<SavedPaymentMethod | null>(null);
  const [formType, setFormType] = useState<MethodType | null>(null);
  const [formCardNumber, setFormCardNumber] = useState("");
  const [formCardholder, setFormCardholder] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    const m = await getPaymentMethods();
    setMethods(m);
  };

  // ---- Actions ----
  const handleOpenAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetForm();
    setEditingMethod(null);
    setFormType(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (method: SavedPaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActionSheet(false);
    setEditingMethod(method);
    setFormType(method.type);
    setFormCardNumber(method.details.cardNumber || "");
    setFormCardholder(method.details.cardholderName || "");
    setFormExpiry(method.details.expiry || "");
    setFormProvider(method.details.provider || "");
    setFormPhone(method.details.phoneNumber || "");
    setFormEmail(method.details.email || "");
    setShowAddModal(true);
  };

  const handleSetDefault = async (method: SavedPaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActionSheet(false);
    const updated = await setDefaultPaymentMethod(method.id);
    setMethods(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (method: SavedPaymentMethod) => {
    setShowActionSheet(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Remove Payment Method",
      `Are you sure you want to remove ${method.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updated = await deletePaymentMethod(method.id);
            setMethods(updated);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setFormType(null);
    setFormCardNumber("");
    setFormCardholder("");
    setFormExpiry("");
    setFormProvider("");
    setFormPhone("");
    setFormEmail("");
  };

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const handleSave = async () => {
    if (!formType) return;

    const isEditing = !!editingMethod;
    let name = "";
    let description = "";
    let details: SavedPaymentMethod["details"] = {};

    if (formType === "card") {
      if (
        !formCardNumber.replace(/\s/g, "") ||
        !formCardholder ||
        !formExpiry
      ) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      const firstDigit = formCardNumber.replace(/\s/g, "")[0];
      name =
        firstDigit === "4"
          ? "Visa"
          : firstDigit === "5"
            ? "Mastercard"
            : "Card";
      description = `•••• ${formCardNumber.replace(/\s/g, "").slice(-4)}`;
      details = {
        cardNumber: formCardNumber.replace(/\s/g, ""),
        cardholderName: formCardholder,
        expiry: formExpiry,
      };
    } else if (formType === "mobile_money") {
      if (!formProvider || !formPhone) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      name = formProvider;
      description = formPhone;
      details = { provider: formProvider, phoneNumber: formPhone };
    } else {
      if (!formEmail) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      name = formType === "apple_pay" ? "Apple Pay" : "PayPal";
      description = formEmail;
      details = { email: formEmail };
    }

    try {
      if (isEditing && editingMethod) {
        const updated = await updatePaymentMethod(editingMethod.id, {
          name,
          description,
          details,
        });
        setMethods(updated);
      } else {
        const noDefault = methods.length === 0;
        const newMethod: SavedPaymentMethod = {
          id: generateId(),
          type: formType,
          name,
          description,
          isDefault: noDefault,
          details,
        };
        const updated = await addPaymentMethod(newMethod);
        setMethods(updated);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddModal(false);
      resetForm();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleToggleDefault = async (method: SavedPaymentMethod) => {
    const updated = await updatePaymentMethod(method.id, {
      isDefault: !method.isDefault,
    });
    setMethods(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ---- Render ----
  return (
    <ScreenLayout>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <TabHeader alt="SETTINGS" title="Payment Methods" />

      <Text className="text-[18px] text-[#ACA9A0] mt-4 mb-3">SAVED METHODS</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {methods.length === 0 ? (
            <View className="p-8 items-center">
              <Ionicons name="wallet-outline" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 text-sm mt-2">
                No payment methods saved
              </Text>
            </View>
          ) : (
            methods.map((method, index) => (
              <View
                key={method.id}
                className={`p-4 ${index < methods.length - 1 ? "border-b border-[#EFEDE7]" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    className="flex-row items-center gap-3 flex-1"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleOpenEdit(method);
                    }}
                  >
                    <View className="size-12 bg-sand-100 rounded-full items-center justify-center">
                      <Ionicons
                        name={METHOD_META[method.type].icon}
                        size={22}
                        color="black"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-base font-semibold">
                          {method.name}
                        </Text>
                        {method.isDefault && (
                          <View className="bg-black px-2 py-0.5 rounded-full">
                            <Text className="text-white text-xs font-semibold">
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-[#6E6B63]">
                        {method.description}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedMethod(method);
                      setShowActionSheet(true);
                    }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color="#9C988E"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Method Button */}
        <TouchableOpacity
          className="bg-white border-2 border-dashed border-[#EFEDE7] rounded-2xl p-4 mt-4 items-center"
          onPress={handleOpenAdd}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add-circle-outline" size={24} color="#283D5A" />
            <Text className="text-base font-semibold">Add Payment Method</Text>
          </View>
        </TouchableOpacity>

        {/* Info */}
        <View className="bg-sand-100 rounded-2xl p-4 mt-4">
          <Text className="text-sm font-semibold mb-2">Payment Methods</Text>
          <Text className="text-xs text-[#6E6B63] leading-relaxed">
            Manage your payment methods for hotel bookings and services.
            Payment details are encrypted and stored securely on your device.
          </Text>
        </View>

        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-800 mb-1">
                Secure & Local
              </Text>
              <Text className="text-xs text-blue-700 leading-relaxed">
                All payment information stays on your device. Nothing is sent to
                our servers.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ---- Add / Edit Modal ---- */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-lg font-bold text-navy">
                {editingMethod ? "Edit Method" : "Add Payment Method"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="px-5 pt-4"
              showsVerticalScrollIndicator={false}
            >
              {!formType ? (
                <View className="pb-6">
                  <Text className="text-sm text-gray-500 mb-4">
                    Select payment type
                  </Text>
                  {([
                    { key: "card" as MethodType, icon: "card-outline", title: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
                    { key: "mobile_money" as MethodType, icon: "phone-portrait-outline", title: "Mobile Money", desc: "MTN MoMo, Airtel Money, MPesa" },
                    { key: "apple_pay" as MethodType, icon: "logo-apple", title: "Apple Pay", desc: "Pay using Apple Pay" },
                    { key: "paypal" as MethodType, icon: "logo-paypal", title: "PayPal", desc: "Pay using PayPal" },
                  ]).map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      className="flex-row items-center gap-4 p-4 mb-2 rounded-2xl bg-sand-100"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFormType(opt.key);
                      }}
                    >
                      <View className="size-10 bg-white rounded-full items-center justify-center">
                        <Ionicons name={opt.icon} size={20} color="#283D5A" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-navy">
                          {opt.title}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {opt.desc}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="pb-6">
                  <TouchableOpacity
                    className="flex-row items-center gap-1 mb-4"
                    onPress={() => {
                      if (!editingMethod) {
                        setFormType(null);
                      }
                    }}
                  >
                    {!editingMethod && (
                      <>
                        <Ionicons
                          name="arrow-back"
                          size={18}
                          color="#9CA3AF"
                        />
                        <Text className="text-sm text-gray-500">Back</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {formType === "card" && (
                    <>
                      <Text className="text-sm font-semibold text-navy mb-1">
                        Card Number
                      </Text>
                      <TextInput
                        className="bg-sand-100 rounded-xl p-4 mb-3 text-base"
                        placeholder="1234 5678 9012 3456"
                        keyboardType="number-pad"
                        value={formCardNumber}
                        onChangeText={(t) =>
                          setFormCardNumber(formatCardNumber(t))
                        }
                      />
                      <Text className="text-sm font-semibold text-navy mb-1">
                        Cardholder Name
                      </Text>
                      <TextInput
                        className="bg-sand-100 rounded-xl p-4 mb-3 text-base"
                        placeholder="John Doe"
                        value={formCardholder}
                        onChangeText={setFormCardholder}
                      />
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-navy mb-1">
                            Expiry
                          </Text>
                          <TextInput
                            className="bg-sand-100 rounded-xl p-4 mb-3 text-base"
                            placeholder="MM/YY"
                            keyboardType="number-pad"
                            value={formExpiry}
                            onChangeText={(t) =>
                              setFormExpiry(formatExpiry(t))
                            }
                          />
                        </View>
                      </View>
                    </>
                  )}

                  {formType === "mobile_money" && (
                    <>
                      <Text className="text-sm font-semibold text-navy mb-1">
                        Provider
                      </Text>
                      <View className="flex-row flex-wrap gap-2 mb-3">
                        {MOBILE_PROVIDERS.map((p) => (
                          <TouchableOpacity
                            key={p}
                            className={`px-4 py-2.5 rounded-xl ${formProvider === p ? "bg-navy" : "bg-sand-100"}`}
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                              );
                              setFormProvider(p);
                            }}
                          >
                            <Text
                              className={`text-sm font-semibold ${formProvider === p ? "text-white" : "text-navy"}`}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text className="text-sm font-semibold text-navy mb-1">
                        Phone Number
                      </Text>
                      <TextInput
                        className="bg-sand-100 rounded-xl p-4 mb-3 text-base"
                        placeholder="+233 24 123 4567"
                        keyboardType="phone-pad"
                        value={formPhone}
                        onChangeText={setFormPhone}
                      />
                    </>
                  )}

                  {(formType === "apple_pay" || formType === "paypal") && (
                    <>
                      <View className="bg-sand-100 rounded-2xl p-4 mb-4">
                        <View className="flex-row items-center gap-3">
                          <Ionicons
                            name={
                              formType === "apple_pay"
                                ? "logo-apple"
                                : "logo-paypal"
                            }
                            size={28}
                            color="#283D5A"
                          />
                          <Text className="text-base font-semibold text-navy">
                            {formType === "apple_pay"
                              ? "Apple Pay"
                              : "PayPal"}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm font-semibold text-navy mb-1">
                        Account Email
                      </Text>
                      <TextInput
                        className="bg-sand-100 rounded-xl p-4 mb-3 text-base"
                        placeholder="email@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formEmail}
                        onChangeText={setFormEmail}
                      />
                    </>
                  )}

                  <TouchableOpacity
                    className="bg-navy rounded-2xl py-4 items-center mt-2"
                    onPress={handleSave}
                  >
                    <Text className="text-white font-semibold text-lg">
                      {editingMethod ? "Save Changes" : "Add Method"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ---- Action Sheet Modal ---- */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowActionSheet(false);
          }}
        >
          <View className="bg-white rounded-t-3xl pb-8">
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            {selectedMethod && (
              <>
                <View className="items-center py-3 border-b border-gray-100">
                  <View className="size-12 bg-sand-100 rounded-full items-center justify-center mb-2">
                    <Ionicons
                      name={METHOD_META[selectedMethod.type].icon}
                      size={22}
                      color="black"
                    />
                  </View>
                  <Text className="text-base font-semibold text-navy">
                    {selectedMethod.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {selectedMethod.description}
                  </Text>
                </View>

                <TouchableOpacity
                  className="flex-row items-center gap-3 px-6 py-4"
                  onPress={() => handleToggleDefault(selectedMethod)}
                >
                  <Ionicons
                    name={
                      selectedMethod.isDefault
                        ? "star"
                        : "star-outline"
                    }
                    size={22}
                    color="#283D5A"
                  />
                  <Text className="text-base text-navy">
                    {selectedMethod.isDefault
                      ? "Remove as Default"
                      : "Set as Default"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-3 px-6 py-4"
                  onPress={() => handleOpenEdit(selectedMethod)}
                >
                  <Ionicons name="create-outline" size={22} color="#283D5A" />
                  <Text className="text-base text-navy">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-3 px-6 py-4"
                  onPress={() => handleDelete(selectedMethod)}
                >
                  <Ionicons name="trash-outline" size={22} color="#DC2626" />
                  <Text className="text-base text-error">Remove</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenLayout>
  );
}