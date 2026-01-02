"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          hero_badge: "✨ THE INTELLIGENT GYM ECOSYSTEM",
          hero_title_1: "Elevate Your",
          hero_title_2: "Fitness Business",
          hero_desc: "GymNexus is a powerful, unified multi-tenant platform to manage members, automate scheduling, and track growth with precision analytics.",
          login_to: "Login to",
          get_started: "Get Started",
          what_we_do_label: "WHAT WE DO",
          what_we_do_title_1: "We Bridge the Gap Between",
          what_we_do_title_2: "Management",
          what_we_do_title_3: "and",
          what_we_do_title_4: "Experience",
          what_we_do_desc: "GymNexus empowers gym owners to transcend traditional management barriers through a unified, data-driven platform that integrates member engagement, automated operations, and advanced growth analytics.",
          feature_1: "Multi-tenant architecture for managing multiple branches effortlessly.",
          feature_2: "Real-time activity tracking and member engagement monitoring.",
          feature_3: "Enterprise-grade security and role-based access control.",
          our_product_label: "OUR PRODUCT",
          our_product_title_1: "Built for",
          our_product_title_2: "Performance",
          prod_1_title: "Nexus Command",
          prod_1_desc: "Centralized multi-tenant dashboard. Manage all your gyms, members, and staff from a single overhead view.",
          prod_2_title: "Gatekeeper AI",
          prod_2_desc: "Seamless, high-security QR check-in system. Instant access verification for members with zero friction.",
          prod_3_title: "CRM Sync",
          prod_3_desc: "Advanced member profiling. Track attendance, subscription health, and interaction history automatically.",
          prod_4_title: "Vision Analytics",
          prod_4_desc: "Predictive revenue models and peak-hour heatmaps. Make data-driven decisions for your business growth.",
          prod_5_title: "Role Fortress",
          prod_5_desc: "Enterprise-grade permission system. Secure access for coaches, receptionists, and managers.",
          prod_6_title: "Asset Watch",
          prod_6_desc: "Keep track of gym equipment, maintenance logs, and inventory levels in real-time.",
          cta_title: "Ready to Transform Your Gym?",
          cta_desc: "Join the elite fitness centers scaling with GymNexus.",
          contact_sales: "Contact Sales",
          footer_desc: "The world's most advanced management ecosystem for fitness professionals and centers.",
          engineered: "Engineered for Excellence."
        }
      },
      id: {
        translation: {
          hero_badge: "✨ EKOSISTEM GYM CERDAS",
          hero_title_1: "Tingkatkan",
          hero_title_2: "Bisnis Kebugaran Anda",
          hero_desc: "GymNexus adalah platform multi-tenant yang kuat dan terpadu untuk mengelola anggota, otomatisasi jadwal, dan melacak pertumbuhan dengan analisis presisi.",
          login_to: "Masuk ke",
          get_started: "Mulai Sekarang",
          what_we_do_label: "APA YANG KAMI LAKUKAN",
          what_we_do_title_1: "Kami Menghubungkan Celah Antara",
          what_we_do_title_2: "Manajemen",
          what_we_do_title_3: "dan",
          what_we_do_title_4: "Pengalaman",
          what_we_do_desc: "GymNexus memberdayakan pemilik gym untuk melampaui hambatan manajemen tradisional melalui platform berbasis data yang menyatukan keterlibatan anggota, operasional otomatis, dan analisis pertumbuhan tingkat lanjut.",
          feature_1: "Arsitektur multi-tenant untuk mengelola banyak cabang dengan mudah.",
          feature_2: "Pelacakan aktivitas real-time dan pemantauan keterlibatan anggota.",
          feature_3: "Keamanan tingkat perusahaan dan kontrol akses berbasis peran.",
          our_product_label: "PRODUK KAMI",
          our_product_title_1: "Dibuat untuk",
          our_product_title_2: "Performa",
          prod_1_title: "Nexus Command",
          prod_1_desc: "Dasbor multi-tenant terpusat. Kelola semua gym, anggota, dan staf Anda dari satu tampilan atas.",
          prod_2_title: "Gatekeeper AI",
          prod_2_desc: "Sistem check-in QR yang mulus dan sangat aman. Verifikasi akses instan untuk anggota tanpa hambatan.",
          prod_3_title: "CRM Sync",
          prod_3_desc: "Pembuatan profil anggota tingkat lanjut. Lacak kehadiran, kesehatan langganan, dan riwayat interaksi secara otomatis.",
          prod_4_title: "Vision Analytics",
          prod_4_desc: "Model pendapatan prediktif dan heatmap jam sibuk. Ambil keputusan berbasis data untuk pertumbuhan bisnis Anda.",
          prod_5_title: "Role Fortress",
          prod_5_desc: "Sistem perizinan tingkat perusahaan. Akses aman untuk pelatih, resepsionis, dan manajer.",
          prod_6_title: "Asset Watch",
          prod_6_desc: "Pantau peralatan gym, log pemeliharaan, dan tingkat inventaris secara real-time.",
          cta_title: "Siap Mentransformasi Gym Anda?",
          cta_desc: "Bergabunglah dengan pusat kebugaran elit yang berkembang bersama GymNexus.",
          contact_sales: "Hubungi Penjualan",
          footer_desc: "Ekosistem manajemen tercanggih di dunia untuk profesional dan pusat kebugaran.",
          engineered: "Dirancang untuk Keunggulan."
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
