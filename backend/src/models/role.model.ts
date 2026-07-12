import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export interface IRole extends Document, SoftDeleteDocument {
  name: string;
  permissions: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
RoleSchema.plugin(softDeletePlugin);

export const Role = model<IRole>('Role', RoleSchema);
