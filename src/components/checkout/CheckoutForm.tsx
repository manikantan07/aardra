'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ShippingAddress } from '@/types';

interface Props {
  onSubmit: (address: ShippingAddress) => void;
  loading?: boolean;
}

export default function CheckoutForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.line1.trim()) newErrors.line1 = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zip.trim()) newErrors.zip = 'ZIP code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(form.zip)) newErrors.zip = 'Invalid ZIP code';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof ShippingAddress]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const Field = ({
    label, name, type = 'text', placeholder, required = true, colClass = 'col-md-6',
  }: {
    label: string; name: keyof ShippingAddress; type?: string;
    placeholder?: string; required?: boolean; colClass?: string;
  }) => (
    <div className={colClass}>
      <label className="form-label" htmlFor={name}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        value={form[name] ?? ''}
        onChange={handleChange}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        required={required}
      />
      {errors[name] && (
        <div id={`${name}-error`} className="invalid-feedback">{errors[name]}</div>
      )}
    </div>
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3 text-dark">Contact Information</h6>
        <div className="row g-3">
          <Field label="First Name" name="firstName" placeholder="John" />
          <Field label="Last Name" name="lastName" placeholder="Doe" />
          <Field label="Email Address" name="email" type="email" placeholder="john@example.com" colClass="col-md-7" />
          <Field label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" colClass="col-md-5" />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3 text-dark">Shipping Address</h6>
        <div className="row g-3">
          <Field label="Address Line 1" name="line1" placeholder="123 Main Street" colClass="col-12" />
          <Field label="Apartment, Suite, etc." name="line2" placeholder="Apt 4B (optional)" colClass="col-12" required={false} />
          <Field label="City" name="city" placeholder="New York" colClass="col-md-5" />
          <Field label="State" name="state" placeholder="NY" colClass="col-md-3" />
          <Field label="ZIP Code" name="zip" placeholder="10001" colClass="col-md-4" />
          <div className="col-12">
            <label className="form-label" htmlFor="country">
              Country <span className="text-danger">*</span>
            </label>
            <select
              id="country"
              name="country"
              className="form-select"
              value={form.country}
              onChange={handleChange}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
            </select>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="btn btn-accent w-100 py-3 rounded-pill"
        style={{ fontSize: '1rem', fontWeight: 700 }}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Redirecting to Stripe…
          </>
        ) : (
          '🔒 Continue to Payment'
        )}
      </motion.button>
    </motion.form>
  );
}
