export interface GeoDivision {
  id: string;
  nameEn: string;
  nameBn: string;
}

export interface GeoDistrict {
  id: string;
  divisionId: string;
  nameEn: string;
  nameBn: string;
}

export interface GeoUpazila {
  id: string;
  districtId: string;
  nameEn: string;
  nameBn: string;
}

export const BD_DIVISIONS: GeoDivision[] = [
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা' },
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' }
];

export const BD_DISTRICTS: GeoDistrict[] = [
  // Dhaka
  { id: 'dhaka', divisionId: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'gazipur', divisionId: 'dhaka', nameEn: 'Gazipur', nameBn: 'গাজীপুর' },
  { id: 'narayanganj', divisionId: 'dhaka', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ' },
  { id: 'tangail', divisionId: 'dhaka', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল' },
  { id: 'faridpur', divisionId: 'dhaka', nameEn: 'Faridpur', nameBn: 'ফরিদপুর' },
  { id: 'manikganj', divisionId: 'dhaka', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ' },
  { id: 'munshiganj', divisionId: 'dhaka', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ' },
  { id: 'narsingdi', divisionId: 'dhaka', nameEn: 'Narsingdi', nameBn: 'নরসিংদী' },
  { id: 'gopalganj', divisionId: 'dhaka', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ' },
  { id: 'madaripur', divisionId: 'dhaka', nameEn: 'Madaripur', nameBn: 'মাদারীপুর' },
  { id: 'rajbari', divisionId: 'dhaka', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী' },
  { id: 'shariatpur', divisionId: 'dhaka', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর' },
  { id: 'kishoreganj', divisionId: 'dhaka', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ' },

  // Chattogram
  { id: 'chattogram', divisionId: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'coxsbazar', divisionId: 'chattogram', nameEn: 'Cox\'s Bazar', nameBn: 'কক্সবাজার' },
  { id: 'cumilla', divisionId: 'chattogram', nameEn: 'Cumilla', nameBn: 'কুমিল্লা' },
  { id: 'feni', divisionId: 'chattogram', nameEn: 'Feni', nameBn: 'ফেনী' },
  { id: 'brahmanbaria', divisionId: 'chattogram', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া' },
  { id: 'noakhali', divisionId: 'chattogram', nameEn: 'Noakhali', nameBn: 'নোয়াখালী' },
  { id: 'chandpur', divisionId: 'chattogram', nameEn: 'Chandpur', nameBn: 'চাঁদপুর' },
  { id: 'lakshmipur', divisionId: 'chattogram', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর' },
  { id: 'khagrachhari', divisionId: 'chattogram', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি' },
  { id: 'rangamati', divisionId: 'chattogram', nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি' },
  { id: 'bandarban', divisionId: 'chattogram', nameEn: 'Bandarban', nameBn: 'বান্দরবান' },

  // Rajshahi
  { id: 'rajshahi', divisionId: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'bogra', divisionId: 'rajshahi', nameEn: 'Bogura', nameBn: 'বগুড়া' },
  { id: 'pabna', divisionId: 'rajshahi', nameEn: 'Pabna', nameBn: 'পাবনা' },
  { id: 'sirajganj', divisionId: 'rajshahi', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ' },
  { id: 'naogaon', divisionId: 'rajshahi', nameEn: 'Naogaon', nameBn: 'নওগাঁ' },
  { id: 'natore', divisionId: 'rajshahi', nameEn: 'Natore', nameBn: 'নাটোর' },
  { id: 'chapainawabganj', divisionId: 'rajshahi', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ' },
  { id: 'joypurhat', divisionId: 'rajshahi', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট' },

  // Khulna
  { id: 'khulna', divisionId: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা' },
  { id: 'jashore', divisionId: 'khulna', nameEn: 'Jashore', nameBn: 'যশোর' },
  { id: 'satkhira', divisionId: 'khulna', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা' },
  { id: 'bagerhat', divisionId: 'khulna', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট' },
  { id: 'kushtia', divisionId: 'khulna', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া' },
  { id: 'jhenaidah', divisionId: 'khulna', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ' },
  { id: 'chuadanga', divisionId: 'khulna', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা' },
  { id: 'meherpur', divisionId: 'khulna', nameEn: 'Meherpur', nameBn: 'মেহেরপুর' },
  { id: 'magura', divisionId: 'khulna', nameEn: 'Magura', nameBn: 'মাগুরা' },
  { id: 'narail', divisionId: 'khulna', nameEn: 'Narail', nameBn: 'নড়াইল' },

  // Barishal
  { id: 'barishal', divisionId: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'bhola', divisionId: 'barishal', nameEn: 'Bhola', nameBn: 'ভোলা' },
  { id: 'patuakhali', divisionId: 'barishal', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী' },
  { id: 'pirojpur', divisionId: 'barishal', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর' },
  { id: 'barguna', divisionId: 'barishal', nameEn: 'Barguna', nameBn: 'বরগুনা' },
  { id: 'jhalokati', divisionId: 'barishal', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি' },

  // Sylhet
  { id: 'sylhet', divisionId: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'moulvibazar', divisionId: 'sylhet', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার' },
  { id: 'habiganj', divisionId: 'sylhet', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ' },
  { id: 'sunamganj', divisionId: 'sylhet', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ' },

  // Rangpur
  { id: 'rangpur', divisionId: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'dinajpur', divisionId: 'rangpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর' },
  { id: 'kurigram', divisionId: 'rangpur', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম' },
  { id: 'gaibandha', divisionId: 'rangpur', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা' },
  { id: 'nilphamari', divisionId: 'rangpur', nameEn: 'Nilphamari', nameBn: 'নীলফামারী' },
  { id: 'panchagarh', divisionId: 'rangpur', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়' },
  { id: 'thakurgaon', divisionId: 'rangpur', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও' },
  { id: 'lalmonirhat', divisionId: 'rangpur', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট' },

  // Mymensingh
  { id: 'mymensingh', divisionId: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
  { id: 'jamalpur', divisionId: 'mymensingh', nameEn: 'Jamalpur', nameBn: 'জামালপুর' },
  { id: 'netrokona', divisionId: 'mymensingh', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা' },
  { id: 'sherpur', divisionId: 'mymensingh', nameEn: 'Sherpur', nameBn: 'শেরপুর' }
];

export const BD_SAMPLE_UPAZILAS: GeoUpazila[] = [
  { id: 'dhanmondi', districtId: 'dhaka', nameEn: 'Dhanmondi', nameBn: 'ধানমন্ডি' },
  { id: 'mirpur', districtId: 'dhaka', nameEn: 'Mirpur', nameBn: 'মিরপুর' },
  { id: 'savar', districtId: 'dhaka', nameEn: 'Savar', nameBn: 'সাভার' },
  { id: 'uttara', districtId: 'dhaka', nameEn: 'Uttara', nameBn: 'উত্তরা' },
  { id: 'keraniganj', districtId: 'dhaka', nameEn: 'Keraniganj', nameBn: 'কেরানীগঞ্জ' },
  { id: 'kotwali_ctg', districtId: 'chattogram', nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
  { id: 'hathazari', districtId: 'chattogram', nameEn: 'Hathazari', nameBn: 'হাটহাজারী' },
  { id: 'sitakunda', districtId: 'chattogram', nameEn: 'Sitakunda', nameBn: 'সীতাকুণ্ড' },
  { id: 'boalia', districtId: 'rajshahi', nameEn: 'Boalia', nameBn: 'বোয়ালিয়া' },
  { id: 'paba', districtId: 'rajshahi', nameEn: 'Paba', nameBn: 'পবা' },
  { id: 'kotwali_khulna', districtId: 'khulna', nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
  { id: 'dumuria', districtId: 'khulna', nameEn: 'Dumuria', nameBn: 'ডুমুরিয়া' },
  { id: 'sadar_barishal', districtId: 'barishal', nameEn: 'Barishal Sadar', nameBn: 'বরিশাল সদর' },
  { id: 'sadar_sylhet', districtId: 'sylhet', nameEn: 'Sylhet Sadar', nameBn: 'সিলেট সদর' },
  { id: 'sadar_rangpur', districtId: 'rangpur', nameEn: 'Rangpur Sadar', nameBn: 'রংপুর সদর' },
  { id: 'sadar_mymensingh', districtId: 'mymensingh', nameEn: 'Mymensingh Sadar', nameBn: 'ময়মনসিংহ সদর' }
];
