import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminQuickActionsModalProps {
  activeAction: string | null;
  onClose: () => void;
}

export const AdminQuickActionsModal: React.FC<AdminQuickActionsModalProps> = ({
  activeAction,
  onClose,
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (activeAction) {
      if (activeAction === 'create_product') {
        navigate('/admin/products?action=create');
      } else if (activeAction === 'create_coupon') {
        navigate('/admin/coupons?action=create');
      } else if (activeAction === 'create_automation') {
        navigate('/admin/automations?action=create');
      }
      onClose();
    }
  }, [activeAction, navigate, onClose]);

  return null;
};
