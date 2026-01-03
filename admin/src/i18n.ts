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
          // ... (existing landing page keys)
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
          engineered: "Engineered for Excellence.",
          
          // Admin Panel
          sidebar: {
            main_menu: "MAIN MENU",
            dashboard: "Dashboard",
            check_in: "Check In",
            members: "Members",
            trainers: "Trainers",
            schedule: "Schedule",
            reports: "Reports",
            activity: "Activity",
            equipment: "Equipments",
            settings: "Settings",
            logout: "Logout"
          },
          common: {
            search: "Search...",
            add_new: "Add New",
            edit: "Edit",
            delete: "Delete",
            cancel: "Cancel",
            save: "Save",
            confirm: "Confirm",
            filter: "Filter",
            actions: "Actions",
            status: "Status"
          },
          dashboard: {
            title: "Dashboard",
            welcome: "Welcome back",
            stats: {
              active_members: "Active Members",
              total_members: "Total Members",
              daily_checkins: "Daily Check-ins",
              total_trainers: "Total Trainers",
              equipment_count: "Equipment Count",
              monthly_revenue: "Est. Revenue"
            },
            quick_actions: "Quick Actions",
            recent_checkins: "Recent Check-ins",
            view_all: "View All",
            today: "Today",
            expiring_members: "Expiring Members"
          },
          members: {
            title: "Member Management",
            subtitle: "Manage active memberships and user profiles.",
            add_btn: "Add Member",
            search_placeholder: "Search by name or email...",
            table: {
              name: "NAME",
              plan: "PLAN",
              status: "STATUS",
              joined: "JOINED",
              actions: "ACTIONS"
            }
          },
          trainers: {
            title: "Trainer Directory",
            subtitle: "Manage your fitness coaches and personal trainers.",
            add_btn: "Add Trainer",
            search_placeholder: "Search trainers...",
            table: {
              trainer: "TRAINER",
              specialization: "SPECIALIZATION",
              experience: "EXPERIENCE",
              status: "STATUS",
              actions: "ACTIONS"
            }
          },
          equipment: {
            title: "Equipment Inventory",
            subtitle: "Track gym assets and their status.",
            add_btn: "Add Equipment",
            table: {
              name: "EQUIPMENT NAME",
              brand: "BRAND",
              category: "CATEGORY",
              status: "STATUS",
              actions: "ACTIONS"
            },
            status: {
              active: "Active",
              broken: "Broken"
            }
          },
          activity: {
            title: "Activity Log",
            subtitle: "Track recent activities and administrative actions.",
            filter_date: "Filter Date",
            no_logs: "No activity logs found.",
            filter_type: {
                all: "All Activities",
                member: "Members",
                trainer: "Trainers",
                equipment: "Equipment",
                check: "Check-ins"
            }
          },
          reports: {
            title: "Analytics & Reports",
            subtitle: "Visualize your gym's performance and growth.",
            peak_hours: "Peak Hours",
            weekly_checkins: "Weekly Check-ins"
          },
          settings: {
            title: "Gym Settings",
            subtitle: "Customize your gym's appearance and contact info",
            save_btn: "Save Changes",
            saving: "Saving...",
            success: "Settings saved successfully!",
            branding: "Branding",
            gym_name: "Gym Name",
            logo: "Logo",
            upload_logo: "Upload Logo",
            primary_color: "Primary Color",
            secondary_color: "Secondary Color",
            contact_info: "Contact Info",
            address: "Address",
            phone: "Phone",
            email: "Email",
            preferences: "Preferences",
            language: "Language"
          },
          schedule: {
            title: "Class Schedule",
            subtitle: "Manage weekly timetables and trainer assignments.",
            add_btn: "Add Class",
            time: "TIME",
            trainer: "TRAINER",
            capacity: "CAPACITY",
            full: "FULL",
            open: "OPEN"
          },
          check_in_page: {
            exit_kiosk: "Exit Kiosk Mode",
            camera_active: "Camera Active",
            standby: "Standby",
            camera_error: "Camera Error",
            unable_access_camera: "Unable to access camera",
            retry: "Retry",
            verifying: "Verifying...",
            checked_out: "Checked Out",
            access_granted: "Access Granted",
            thank_you: "Thank you for visiting!",
            days_remaining: "days remaining",
            access_denied: "Access Denied",
            membership_suspended: "Membership Suspended",
            contact_admin: "Please contact administration",
            membership_expired: "Membership Expired",
            renew_membership: "Please renew your membership",
            membership_not_found: "Membership Not Found",
            invalid_membership: "Invalid membership for this gym",
            wrong_gym: "Wrong Gym",
            wrong_gym_info: "This QR code is for a different gym",
            wrong_gym_reason: "Please use the correct gym's scanner",
            system_error: "System Error",
            verify_error_info: "Unable to verify membership",
            try_again: "Please try again",
            position_qr: "Position QR Code within frame",
            scan_next: "Scan Next Member",
            qr_check_in: "QR Check In",
            manual_check_in: "Manual Check-In",
            verify_member: "Verify Member",
            search_placeholder: "Search by email or phone...",
            search_btn: "Search",
            searching: "Searching...",
            no_members_found: "No members found",
            enter_search: "Enter email or phone to search",
            view_btn: "View",
            unknown: "Unknown",
            confirm_check_in: "Confirm Check-In",
            invalid_qr: "Invalid QR Code",
            qr_missing_info: "QR code is missing required information",
            invalid_qr_format: "Invalid QR Data Format",
            parse_error: "Could not parse QR data"
          }
        }
      },
      id: {
        translation: {
          // ... (existing landing page keys)
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
          prod_1_desc: "Dashboard multi-tenant terpusat. Kelola semua gym, anggota, dan staf Anda dari satu tampilan atas.",
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
          engineered: "Dirancang untuk Keunggulan.",
          
          // Admin Panel
          sidebar: {
            main_menu: "MENU UTAMA",
            dashboard: "Dashboard",
            check_in: "Check In",
            members: "Anggota",
            trainers: "Pelatih",
            schedule: "Jadwal",
            reports: "Laporan",
            activity: "Aktivitas",
            equipment: "Peralatan",
            settings: "Pengaturan",
            logout: "Keluar"
          },
          common: {
            search: "Cari...",
            add_new: "Tambah Baru",
            edit: "Ubah",
            delete: "Hapus",
            cancel: "Batal",
            save: "Simpan",
            confirm: "Konfirmasi",
            filter: "Filter",
            actions: "Aksi",
            status: "Status"
          },
          dashboard: {
            title: "Dashboard",
            welcome: "Selamat datang kembali",
            stats: {
              active_members: "Anggota Aktif",
              total_members: "Total Anggota",
              daily_checkins: "Check-in Harian",
              total_trainers: "Total Pelatih",
              equipment_count: "Jumlah Alat",
              monthly_revenue: "Est. Pendapatan"
            },
            quick_actions: "Aksi Cepat",
            recent_checkins: "Check-in Terbaru",
            view_all: "Lihat Semua",
            today: "Hari Ini",
            expiring_members: "Anggota Segera Habis"
          },
          members: {
            title: "Manajemen Anggota",
            subtitle: "Kelola keanggotaan aktif dan profil pengguna.",
            add_btn: "Tambah Anggota",
            search_placeholder: "Cari nama atau email...",
            table: {
              name: "NAMA",
              plan: "PAKET",
              status: "STATUS",
              joined: "BERGABUNG",
              actions: "AKSI"
            }
          },
          trainers: {
            title: "Direktori Pelatih",
            subtitle: "Kelola pelatih kebugaran dan personal trainer Anda.",
            add_btn: "Tambah Pelatih",
            search_placeholder: "Cari pelatih...",
            table: {
              trainer: "PELATIH",
              specialization: "SPESIALISASI",
              experience: "PENGALAMAN",
              status: "STATUS",
              actions: "AKSI"
            }
          },
          equipment: {
            title: "Inventaris Alat",
            subtitle: "Lacak aset gym dan statusnya.",
            add_btn: "Tambah Alat",
            table: {
              name: "NAMA ALAT",
              brand: "MERK",
              category: "KATEGORI",
              status: "STATUS",
              actions: "AKSI"
            },
            status: {
              active: "Aktif",
              broken: "Rusak"
            }
          },
          activity: {
            title: "Log Aktivitas",
            subtitle: "Lacak aktivitas terbaru dan tindakan administratif.",
            filter_date: "Filter Tanggal",
            no_logs: "Tidak ada log aktivitas ditemukan.",
            filter_type: {
                all: "Semua Aktivitas",
                member: "Anggota",
                trainer: "Pelatih",
                equipment: "Peralatan",
                check: "Check-in"
            }
          },
          reports: {
            title: "Analitik & Laporan",
            subtitle: "Visualisasikan performa dan pertumbuhan gym Anda.",
            peak_hours: "Jam Sibuk",
            weekly_checkins: "Check-in Mingguan"
          },
          settings: {
            title: "Pengaturan Gym",
            subtitle: "Sesuaikan tampilan dan info kontak gym Anda",
            save_btn: "Simpan Perubahan",
            saving: "Menyimpan...",
            success: "Pengaturan berhasil disimpan!",
            branding: "Branding",
            gym_name: "Nama Gym",
            logo: "Logo",
            upload_logo: "Unggah Logo",
            primary_color: "Warna Utama",
            secondary_color: "Warna Sekunder",
            contact_info: "Info Kontak",
            address: "Alamat",
            phone: "Telepon",
            email: "Email",
            preferences: "Preferensi",
            language: "Bahasa"
          },
          schedule: {
            title: "Jadwal Kelas",
            subtitle: "Kelola jadwal mingguan dan penugasan pelatih.",
            add_btn: "Tambah Kelas",
            time: "WAKTU",
            trainer: "PELATIH",
            capacity: "KAPASITAS",
            full: "PENUH",
            open: "BUKA"
          },
          check_in_page: {
            exit_kiosk: "Keluar Mode Kiosk",
            camera_active: "Kamera Aktif",
            standby: "Siaga",
            camera_error: "Kesalahan Kamera",
            unable_access_camera: "Tidak dapat mengakses kamera",
            retry: "Coba Lagi",
            verifying: "Memverifikasi...",
            checked_out: "Check-out Berhasil",
            access_granted: "Akses Diterima",
            thank_you: "Terima kasih atas kunjungan Anda!",
            days_remaining: "hari tersisa",
            access_denied: "Akses Ditolak",
            membership_suspended: "Keanggotaan Ditangguhkan",
            contact_admin: "Silakan hubungi administrasi",
            membership_expired: "Keanggotaan Kedaluwarsa",
            renew_membership: "Silakan perbarui keanggotaan Anda",
            membership_not_found: "Keanggotaan Tidak Ditemukan",
            invalid_membership: "Keanggotaan tidak valid untuk gym ini",
            wrong_gym: "Gym Salah",
            wrong_gym_info: "Kode QR ini untuk gym yang berbeda",
            wrong_gym_reason: "Silakan gunakan pemindai gym yang benar",
            system_error: "Kesalahan Sistem",
            verify_error_info: "Tidak dapat memverifikasi keanggotaan",
            try_again: "Silakan coba lagi",
            position_qr: "Posisikan Kode QR di dalam bingkai",
            scan_next: "Pindai Anggota Berikutnya",
            qr_check_in: "Check In QR",
            manual_check_in: "Check-In Manual",
            verify_member: "Verifikasi Anggota",
            search_placeholder: "Cari berdasarkan email atau telepon...",
            search_btn: "Cari",
            searching: "Mencari...",
            no_members_found: "Anggota tidak ditemukan",
            enter_search: "Masukkan email atau telepon untuk mencari",
            view_btn: "Lihat",
            unknown: "Tidak Diketahui",
            confirm_check_in: "Konfirmasi Check-In",
            invalid_qr: "Kode QR Tidak Valid",
            qr_missing_info: "Kode QR kehilangan informasi yang diperlukan",
            invalid_qr_format: "Format Data QR Tidak Valid",
            parse_error: "Tidak dapat mengurai data QR"
          }
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
