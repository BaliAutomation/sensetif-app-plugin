import React from 'react';
import { Card, ConfirmModal, IconButton } from '@grafana/ui';

interface CardActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CardActions = ({ onDelete, onEdit }: CardActionsProps) => {
  return (
    <Card.SecondaryActions>
      {onEdit && (
        <IconButton
          key="edit"
          name="edit"
          tooltip="Edit"
          tooltipPlacement="top"
          size="xl"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        />
      )}
      {onDelete && (
        <IconButton
          key="delete"
          name="trash-alt"
          tooltip="Delete"
          tooltipPlacement="top"
          size="xl"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      )}
    </Card.SecondaryActions>
  );
};

interface DeleteCardModalProps {
  isOpen: boolean;
  title: string;
  body: React.ReactNode;
  onDismiss: () => void;
  onConfirm: () => void;
}

export const DeleteCardModal = (props: DeleteCardModalProps) => {
  return (
    <ConfirmModal
      isOpen={props.isOpen}
      icon={'trash-alt'}
      confirmText={'Delete'}
      title={props.title}
      body={props.body}
      onDismiss={props.onDismiss}
      onConfirm={props.onConfirm}
    />
  );
};
