import { Schema, Query } from 'mongoose';

export interface SoftDeleteDocument {
  isDeleted: boolean;
  deletedAt?: Date | null;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  const excludeDeleted = function (this: Query<any, any>) {
    const query = this.getQuery();
    // If isDeleted is explicitly set in query (e.g. { isDeleted: true } or { isDeleted: false }),
    // do not override it. Otherwise, default to filtering out deleted items.
    if (query && query.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
  };

  // Pre-hooks to filter out soft deleted records automatically
  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('updateOne', excludeDeleted);
  schema.pre('updateMany', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  // Method to soft delete
  schema.methods.softDelete = async function (this: any) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  // Method to restore
  schema.methods.restore = async function (this: any) {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };
}
