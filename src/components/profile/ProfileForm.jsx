import { useState } from "react";

const inputClass =
  "w-full rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export default function ProfileForm({ user, onSave }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    preferredContact: user.preferredContact,
  });
  const [saved, setSaved] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
    setSaved(true);
  };

  return (
    <form className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm" onSubmit={handleSubmit}>
      <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
        <div>
          <h2 className="text-h2 text-on-surface">Personal information</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">Keep your contact details current for case updates.</p>
        </div>
        {saved ? (
          <span className="rounded-full bg-green-50 px-sm py-xxs text-body-sm font-semibold text-green-700">
            Saved
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="space-y-xs">
          <label className="text-label-md uppercase text-on-surface-variant" htmlFor="name">
            Full name
          </label>
          <input className={inputClass} id="name" name="name" value={form.name} onChange={updateField} />
        </div>

        <div className="space-y-xs">
          <label className="text-label-md uppercase text-on-surface-variant" htmlFor="email">
            Email
          </label>
          <input className={inputClass} id="email" name="email" type="email" value={form.email} onChange={updateField} />
        </div>

        <div className="space-y-xs">
          <label className="text-label-md uppercase text-on-surface-variant" htmlFor="phone">
            Phone
          </label>
          <input className={inputClass} id="phone" name="phone" type="tel" value={form.phone} onChange={updateField} />
        </div>

        <div className="space-y-xs">
          <label className="text-label-md uppercase text-on-surface-variant" htmlFor="preferredContact">
            Preferred contact
          </label>
          <select
            className={inputClass}
            id="preferredContact"
            name="preferredContact"
            value={form.preferredContact}
            onChange={updateField}
          >
            <option>Email</option>
            <option>Phone</option>
            <option>SMS</option>
          </select>
        </div>
      </div>

      <div className="mt-md space-y-xs">
        <label className="text-label-md uppercase text-on-surface-variant" htmlFor="address">
          Address
        </label>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          id="address"
          name="address"
          value={form.address}
          onChange={updateField}
        />
      </div>

      <div className="mt-lg flex justify-end">
        <button
          className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container"
          type="submit"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          Save changes
        </button>
      </div>
    </form>
  );
}
