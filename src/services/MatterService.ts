import { Matter, MatterStatus, Client, Lawyer } from '../models/types';

/**
 * Matter Management Service
 * Handles CRUD operations for legal matters
 */
export class MatterService {
  private matters: Map<string, Matter> = new Map();
  private clients: Map<string, Client> = new Map();
  private lawyers: Map<string, Lawyer> = new Map();

  /**
   * Create a new matter
   */
  createMatter(
    title: string,
    description: string,
    clientId: string,
    lawyerId: string
  ): Matter {
    const id = this.generateId();
    const matter: Matter = {
      id,
      title,
      description,
      clientId,
      lawyerId,
      status: MatterStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deadlines: []
    };
    
    this.matters.set(id, matter);
    return matter;
  }

  /**
   * Get matter by ID
   */
  getMatter(id: string): Matter | undefined {
    return this.matters.get(id);
  }

  /**
   * Get all matters
   */
  getAllMatters(): Matter[] {
    return Array.from(this.matters.values());
  }

  /**
   * Get active matters
   */
  getActiveMatters(): Matter[] {
    return this.getAllMatters().filter(m => m.status === MatterStatus.ACTIVE);
  }

  /**
   * Get matters by client
   */
  getMattersByClient(clientId: string): Matter[] {
    return this.getAllMatters().filter(m => m.clientId === clientId);
  }

  /**
   * Get matters by lawyer
   */
  getMattersByLawyer(lawyerId: string): Matter[] {
    return this.getAllMatters().filter(m => m.lawyerId === lawyerId);
  }

  /**
   * Update matter status
   */
  updateMatterStatus(id: string, status: MatterStatus): Matter | undefined {
    const matter = this.matters.get(id);
    if (matter) {
      matter.status = status;
      matter.updatedAt = new Date();
      this.matters.set(id, matter);
    }
    return matter;
  }

  /**
   * Register a client
   */
  registerClient(client: Client): void {
    this.clients.set(client.id, client);
  }

  /**
   * Register a lawyer
   */
  registerLawyer(lawyer: Lawyer): void {
    this.lawyers.set(lawyer.id, lawyer);
  }

  /**
   * Get client by ID
   */
  getClient(id: string): Client | undefined {
    return this.clients.get(id);
  }

  /**
   * Get lawyer by ID
   */
  getLawyer(id: string): Lawyer | undefined {
    return this.lawyers.get(id);
  }

  private generateId(): string {
    return `MTR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
