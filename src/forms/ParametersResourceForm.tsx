import React, { useState, useEffect } from 'react';

interface Props {
  params?: {};
  onCancel: () => void;
}

type formValues = {
};

export const TtnResourceForm = ({ params, onCancel }: Props) => {
  let [formValues] = useState<formValues>();

  useEffect(() => {
    if (!formValues) {
      return;
    }

    (async () => {})()

  }, [formValues]);

  return (
    <>
    </>
  );
};
