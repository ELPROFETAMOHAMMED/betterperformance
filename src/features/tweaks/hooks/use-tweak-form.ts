"use client";

import { useEffect, useState } from "react";

import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

export type TweakFormValues = {
  title: string;
  description: string;
  code: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_description: string;
  notes: string;
  tweak_comment: string;
  docs: string;
  is_visible: boolean;
  create_new_category: boolean;
};

const EMPTY_TWEAK_FORM_VALUES: TweakFormValues = {
  title: "",
  description: "",
  code: "",
  category_id: "",
  category_name: "",
  category_icon: "",
  category_description: "",
  notes: "",
  tweak_comment: "",
  docs: "",
  is_visible: true,
  create_new_category: false,
};

function buildTweakFormValues(
  tweak: Tweak | null | undefined,
  categories: TweakCategory[]
): TweakFormValues {
  if (!tweak) {
    return EMPTY_TWEAK_FORM_VALUES;
  }

  const category = categories.find((item) => item.id === tweak.category_id);

  return {
    title: tweak.title || "",
    description: tweak.description || "",
    code: tweak.code || "",
    category_id: tweak.category_id || "",
    category_name: category?.name || "",
    category_icon: category?.icon || "",
    category_description: category?.description || "",
    notes: tweak.notes || "",
    tweak_comment: tweak.tweak_comment || "",
    docs: tweak.docs || "",
    is_visible: tweak.is_visible ?? true,
    create_new_category: false,
  };
}

export function useTweakForm(
  open: boolean,
  tweak: Tweak | null | undefined,
  categories: TweakCategory[]
) {
  const [formData, setFormData] = useState<TweakFormValues>(
    EMPTY_TWEAK_FORM_VALUES
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(buildTweakFormValues(tweak, categories));
  }, [categories, open, tweak]);

  const handleInputChange = <TField extends keyof TweakFormValues>(
    field: TField,
    value: TweakFormValues[TField]
  ) => {
    setFormData((previousValue) => ({
      ...previousValue,
      [field]: value,
    }));
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm: () => setFormData(EMPTY_TWEAK_FORM_VALUES),
  };
}
