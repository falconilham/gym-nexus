"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Box, Typography, Button, Container, Grid, Paper, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Dumbbell, BarChart3, Users, QrCode, ShieldCheck, LayoutDashboard, Zap, Activity, Globe } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
const PROTOCOL = process.env.NODE_ENV === 'development' ? 'http' : 'https';

const getSubdomainUrl = (subdomain: string) => {
    return `${PROTOCOL}://${subdomain}.${ROOT_DOMAIN}/login`;
}

// Animation configurations
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

interface Gym {
  id: number;
  name: string;
  subdomain: string;
}

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState('en'); // Default to 'en' for SSR

  useEffect(() => {
    // Set mounted and sync language after client-side hydration
    setTimeout(() => {
      setMounted(true);
      setCurrentLang(i18n.language);
    }, 0);
    
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/super-admin/gyms`, {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    })
        .then(res => setGyms(res.data))
        .catch(err => console.error(err));

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [i18n.language]);

  const changeLanguage = (event: React.MouseEvent<HTMLElement>, newLang: string) => {
    if (newLang !== null) {
      i18n.changeLanguage(newLang);
      setCurrentLang(newLang);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
      
      {/* Dynamic Background Pattern */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 0,
        opacity: 0.4,
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Navigation */}
      <Box sx={{ 
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        py: 2, 
        px: { xs: 3, md: 8 }, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: isScrolled ? 'rgba(5, 5, 5, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
      }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ 
                    p: 1, 
                    backgroundColor: 'var(--primary)', 
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(204, 255, 0, 0.3)'
                }}>
                    <Dumbbell size={22} color="black" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -1, color: 'white' }}>
                    GYM<Box component="span" sx={{ color: 'var(--primary)' }}>NEXUS</Box>
                </Typography>
            </Stack>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <ToggleButtonGroup
              value={mounted ? currentLang : 'en'}
              exclusive
              onChange={changeLanguage}
              aria-label="language selector"
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.5)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  px: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  '&.Mui-selected': {
                    color: 'var(--primary)',
                    backgroundColor: 'rgba(204, 255, 0, 0.1)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                }
              }}
            >
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="id">ID</ToggleButton>
            </ToggleButtonGroup>
        </motion.div>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 20, md: 28 }, pb: { xs: 12, md: 20 }, position: 'relative', zIndex: 1 }}>
         <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        gap: 1,
                        px: 2.5, py: 1, 
                        borderRadius: 10, 
                        border: '1px solid rgba(204, 255, 0, 0.2)',
                        backgroundColor: 'rgba(204, 255, 0, 0.05)',
                        color: 'var(--primary)',
                        mb: 4,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        letterSpacing: 0.5
                    }}>
                        <Zap size={16} /> {t('hero_badge')}
                    </Box>
                </motion.div>

                <Typography variant="h1" sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '3.5rem', md: '5.5rem' }, 
                    lineHeight: 0.95, 
                    mb: 3,
                    letterSpacing: -2,
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #999999 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    {t('hero_title_1')} <br/>
                    <Box component="span" sx={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>{t('hero_title_2')}</Box>
                </Typography>

                <Typography variant="h5" sx={{ 
                    color: '#A0A0A0', 
                    mb: 8, 
                    fontWeight: 400, 
                    maxWidth: 700, 
                    mx: 'auto',
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.35rem' }
                }}>
                    {t('hero_desc')}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
                    {gyms.length > 0 ? (
                        gyms.slice(0, 3).map((gym) => (
                            <motion.div key={gym.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                    component={Link}
                                    href={getSubdomainUrl(gym.subdomain)}
                                    variant="contained" 
                                    size="large"
                                    sx={{ 
                                        borderRadius: 2, 
                                        px: 4, py: 2, 
                                        fontSize: '1rem', 
                                        fontWeight: 800,
                                        backgroundColor: 'var(--primary)', 
                                        color: 'black',
                                        textTransform: 'none',
                                        minWidth: 200,
                                        '&:hover': { backgroundColor: '#bbe300' },
                                        boxShadow: '0 10px 20px rgba(204, 255, 0, 0.15)'
                                    }}
                                >
                                    {t('login_to')} {gym.name}
                                </Button>
                            </motion.div>
                        ))
                    ) : (
                        <Button 
                            component={Link}
                            href="/login"
                            variant="contained" 
                            size="large"
                            sx={{ 
                                borderRadius: 2, 
                                px: 6, py: 2.5, 
                                fontSize: '1.2rem', 
                                fontWeight: 800,
                                backgroundColor: 'var(--primary)', 
                                color: 'black',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#bbe300' }
                            }}
                        >
                            {t('get_started')}
                        </Button>
                    )}
                </Stack>
            </Box>
         </motion.div>
      </Container>
      
      {/* What We Do Section */}
      <Box sx={{ py: 15, position: 'relative' }}>
         <Container maxWidth="lg">
            <Grid container spacing={8} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                        <Typography variant="overline" sx={{ color: 'var(--primary)', fontWeight: 800, letterSpacing: 3 }}>
                            {t('what_we_do_label')}
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, mt: 2, mb: 4, lineHeight: 1.1 }}>
                            {t('what_we_do_title_1')} <Box component="span" sx={{ color: 'var(--primary)' }}>{t('what_we_do_title_2')}</Box> {t('what_we_do_title_3')} <Box component="span" sx={{ color: 'var(--secondary)' }}>{t('what_we_do_title_4')}</Box>.
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem', color: '#888', mb: 4, lineHeight: 1.8 }}>
                            {t('what_we_do_desc')}
                        </Typography>
                        <Stack spacing={3}>
                            {[
                                { icon: Globe, text: t('feature_1') },
                                { icon: Activity, text: t('feature_2') },
                                { icon: ShieldCheck, text: t('feature_3') }
                            ].map((item, i) => (
                                <Stack key={i} direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ color: 'var(--primary)' }}><item.icon size={20} /></Box>
                                    <Typography sx={{ color: '#BBB', fontWeight: 500 }}>{item.text}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        whileInView={{ opacity: 1, scale: 1 }} 
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Box sx={{ 
                            position: 'relative',
                            p: 2,
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            borderRadius: 6,
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                        }}>
                             <Box 
                                component="img" 
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000"
                                sx={{ width: '100%', borderRadius: 4, filter: 'grayscale(0.5) contrast(1.1)' }}
                             />
                        </Box>
                    </motion.div>
                </Grid>
            </Grid>
         </Container>
      </Box>

      {/* Product Features Section */}
      <Box sx={{ backgroundColor: '#080808', py: 15, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
         <Container maxWidth="lg">
             <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                 <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" sx={{ color: 'var(--primary)', fontWeight: 800, letterSpacing: 3 }}>
                        {t('our_product_label')}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 900, mt: 2 }}>
                        {t('our_product_title_1')} <Box component="span" sx={{ color: 'var(--primary)' }}>{t('our_product_title_2')}</Box>
                    </Typography>
                 </Box>

                 <Grid container spacing={4}>
                     {[
                        { icon: LayoutDashboard, title: t('prod_1_title'), desc: t('prod_1_desc') },
                        { icon: QrCode, title: t('prod_2_title'), desc: t('prod_2_desc') },
                        { icon: Users, title: t('prod_3_title'), desc: t('prod_3_desc') },
                        { icon: BarChart3, title: t('prod_4_title'), desc: t('prod_4_desc') },
                        { icon: ShieldCheck, title: t('prod_5_title'), desc: t('prod_5_desc') },
                        { icon: Dumbbell, title: t('prod_6_title'), desc: t('prod_6_desc') },
                     ].map((product, idx) => (
                         <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                             <motion.div variants={fadeIn}>
                                 <Paper sx={{ 
                                     p: 5, 
                                     height: '100%',
                                     backgroundColor: 'rgba(255,255,255,0.02)', 
                                     border: '1px solid rgba(255,255,255,0.05)',
                                     borderRadius: 5,
                                     transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                     position: 'relative',
                                     overflow: 'hidden',
                                     '&:hover': { 
                                        borderColor: 'var(--primary)', 
                                        transform: 'translateY(-10px)',
                                        backgroundColor: 'rgba(204, 255, 0, 0.02)',
                                        '& .icon-box': { backgroundColor: 'var(--primary)', color: 'black' }
                                     }
                                 }}>
                                    <Box className="icon-box" sx={{ 
                                        width: 60, height: 60, 
                                        borderRadius: 2.5, 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mb: 4, color: 'var(--primary)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <product.icon size={32} />
                                    </Box>
                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 2 }}>{product.title}</Typography>
                                    <Typography variant="body1" sx={{ color: '#888', lineHeight: 1.7, fontSize: '0.95rem' }}>{product.desc}</Typography>
                                 </Paper>
                             </motion.div>
                         </Grid>
                     ))}
                 </Grid>
             </motion.div>
         </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 20 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Box sx={{ 
                textAlign: 'center', 
                p: { xs: 6, md: 10 }, 
                background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
                borderRadius: 8,
                border: '1px solid rgba(204, 255, 0, 0.2)'
              }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>{t('cta_title')}</Typography>
                  <Typography variant="h6" sx={{ color: '#888', mb: 6, fontWeight: 400 }}>{t('cta_desc')}</Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    sx={{ 
                        borderRadius: 2, 
                        px: 6, py: 2, 
                        fontSize: '1.2rem', 
                        fontWeight: 800,
                        backgroundColor: 'var(--primary)', 
                        color: 'black',
                        '&:hover': { backgroundColor: '#bbe300' }
                    }}
                  >
                    {t('contact_sales')}
                  </Button>
              </Box>
          </motion.div>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 10, px: 3, borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#050505' }}>
          <Container maxWidth="lg">
                <Grid container spacing={6}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ p: 0.8, backgroundColor: 'var(--primary)', borderRadius: 1 }}>
                                    <Dumbbell size={18} color="black" />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                                    GYM<Box component="span" sx={{ color: 'var(--primary)' }}>NEXUS</Box>
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#666', maxWidth: 300, lineHeight: 1.8 }}>
                                {t('footer_desc')}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={4}>
                            {['Product', 'Company', 'Legal'].map((col) => (
                                <Grid size={{ xs: 6, sm: 4 }} key={col}>
                                    <Typography variant="button" sx={{ color: 'white', fontWeight: 800, mb: 3, display: 'block' }}>{col}</Typography>
                                    <Stack spacing={1.5}>
                                        <Typography variant="body2" sx={{ color: '#666', cursor: 'pointer', '&:hover': { color: 'var(--primary)' } }}>Link</Typography>
                                        <Typography variant="body2" sx={{ color: '#666', cursor: 'pointer', '&:hover': { color: 'var(--primary)' } }}>Link</Typography>
                                        <Typography variant="body2" sx={{ color: '#666', cursor: 'pointer', '&:hover': { color: 'var(--primary)' } }}>Link</Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 10, pt: 4, borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#444' }}>
                        © {new Date().getFullYear()} GymNexus. {t('engineered')}
                    </Typography>
                </Box>
          </Container>
      </Box>

    </Box>
  );
}
