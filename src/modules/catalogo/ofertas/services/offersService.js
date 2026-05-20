import { OFFERS_MOCK } from '../mocks/offersMocks';

export const fetchOffers = async () => {
  await new Promise((r) => setTimeout(r, 300));
  return OFFERS_MOCK;
};

export const saveOffer = async (formData, editingId) => {
  await new Promise((r) => setTimeout(r, 200));
  return editingId ? { ...formData, id: editingId } : { ...formData, id: Date.now() };
};

export const deleteOffer = async () => {
  await new Promise((r) => setTimeout(r, 150));
};
