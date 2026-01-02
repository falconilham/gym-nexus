'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

interface GymDetails {
    name: string;
    logo: string; // The URL
    primaryColor: string;
    secondaryColor: string;
    features?: string[];
}

interface GymContextType {
    gym: GymDetails | null;
    isLoading: boolean;
    isNotFound: boolean;
    refreshGym: () => void;
}

const GymContext = createContext<GymContextType>({
    gym: null,
    isLoading: true,
    isNotFound: false,
    refreshGym: () => {},
});

export const useGym = () => useContext(GymContext);

export const GymProvider = ({ children }: { children: ReactNode }) => {
    const [gym, setGym] = useState<GymDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);

    const fetchGymDetails = useCallback(async () => {
        try {
            if (typeof window === 'undefined') return;

            const hostname = window.location.hostname;
            const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').split(':')[0];
            
            // Check if root domain or vercel app (no subdomain logic for them usually, or defaults)
            if (hostname === rootDomain || hostname === `www.${rootDomain}` || hostname === 'gym-nexus.vercel.app') {
               setIsLoading(false);
               return;
            }

            const subdomain = hostname.split('.')[0];
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            
            const response = await axios.get(`${API_URL}/api/client/config`, {
                headers: { 'X-Gym-Subdomain': subdomain }
            });
            console.log('GymContext fetched:', response.data);

            const { name, logo, primaryColor, secondaryColor, features } = response.data;
            setGym({ name, logo, primaryColor, secondaryColor, features });
            setIsNotFound(false);
            
            // Apply CSS variables immediately
            if (primaryColor) document.documentElement.style.setProperty('--primary', primaryColor);
            if (secondaryColor) document.documentElement.style.setProperty('--secondary', secondaryColor);

        } catch (error: unknown) {
            console.error('Failed to load gym config:', error);
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 404) {
                setIsNotFound(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGymDetails();
    }, [fetchGymDetails]);

    return (
        <GymContext.Provider value={{ gym, isLoading, isNotFound, refreshGym: fetchGymDetails }}>
            {children}
        </GymContext.Provider>
    );
};
