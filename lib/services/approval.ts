import { NotificationService } from './notifications';

export class ApprovalService {
  static async approveManufacturer(manufacturerId: string): Promise<void> {
    try {
      await api.post(`/api/manufacturers/${manufacturerId}/approve`);
      await NotificationService.notify({
        recipientId: manufacturerId,
        type: 'manufacturer_approval',
        status: 'approved'
      });
    } catch (error) {
      console.error('Failed to approve manufacturer:', error);
      throw error;
    }
  }

  static async rejectManufacturer(manufacturerId: string, reason: string): Promise<void> {
    try {
      await api.post(`/api/manufacturers/${manufacturerId}/reject`, { reason });
      await NotificationService.notify({
        recipientId: manufacturerId,
        type: 'manufacturer_approval',
        status: 'rejected',
        details: { reason }
      });
    } catch (error) {
      console.error('Failed to reject manufacturer:', error);
      throw error;
    }
  }

  static async approveDocument(documentId: string): Promise<void> {
    try {
      await api.post(`/api/documents/${documentId}/approve`);
      await NotificationService.notify({
        recipientId: documentId,
        type: 'document_approval',
        status: 'approved'
      });
    } catch (error) {
      console.error('Failed to approve document:', error);
      throw error;
    }
  }

  static async rejectDocument(documentId: string, reason: string): Promise<void> {
    try {
      await api.post(`/api/documents/${documentId}/reject`, { reason });
      await NotificationService.notify({
        recipientId: documentId,
        type: 'document_approval',
        status: 'rejected',
        details: { reason }
      });
    } catch (error) {
      console.error('Failed to reject document:', error);
      throw error;
    }
  }

  static async approveDPC(dpcId: string): Promise<void> {
    try {
      await api.post(`/api/certifications/${dpcId}/approve`);
      await NotificationService.notify({
        recipientId: dpcId,
        type: 'dpc_approval',
        status: 'approved'
      });
    } catch (error) {
      console.error('Failed to approve DPC:', error);
      throw error;
    }
  }

  static async rejectDPC(dpcId: string, reason: string): Promise<void> {
    try {
      await api.post(`/api/certifications/${dpcId}/reject`, { reason });
      await NotificationService.notify({
        recipientId: dpcId,
        type: 'dpc_approval',
        status: 'rejected',
        details: { reason }
      });
    } catch (error) {
      console.error('Failed to reject DPC:', error);
      throw error;
    }
  }
}