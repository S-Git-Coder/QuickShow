import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema(
    {
        provider: { type: String, default: 'cashfree' },
        status: { type: String, enum: ['received', 'processed', 'skipped', 'error'], default: 'received' },
        orderId: { type: String },
        event: { type: String },
        headers: { type: Object },
        body: { type: Object },
        error: { type: String },
    },
    { timestamps: true }
);

webhookLogSchema.index({ provider: 1, createdAt: -1 });
webhookLogSchema.index({ orderId: 1, createdAt: -1 });

export default mongoose.model('WebhookLog', webhookLogSchema);
