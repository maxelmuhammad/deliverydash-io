import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { isAdmin, user } = useAuth();
  
  return {
    isAdmin,
    isAdminEmail: user?.email === 'doublequickexpresscouriersserv@gmail.com',
    canManageAllShipments: isAdmin,
    canViewAllShipments: isAdmin,
  };
};