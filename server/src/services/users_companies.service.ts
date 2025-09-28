import type {
  ICompanyUser,
  ICompanyUserForRegister,
  ICompanyUserForUpdate,
} from "@clinai/shared";
import Repository from "../repository";

export default class CompaniesUserService {
  static async getByID(id: string): Promise<ICompanyUser | undefined> {
    const row = await Repository.companies_user.getByID(id);
    return row;
  }

  static async getByUser(user_id: string): Promise<ICompanyUser | undefined> {
    const row = await Repository.companies_user.getByUser(user_id);
    return row;
  }

  static async listByCompany(company_id: string): Promise<ICompanyUser[]> {
    const rows = await Repository.companies_user.listByCompany(company_id);
    return rows;
  }

  static async create(dto: ICompanyUserForRegister): Promise<ICompanyUser> {
    const created = await Repository.companies_user.create(dto);
    return created;
  }

  static async update(
    id: string,
    updates: Partial<ICompanyUserForUpdate>,
  ): Promise<boolean> {
    const updated = await Repository.companies_user.update(id, updates);
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const deleted = await Repository.companies_user.delete(id);
    return deleted;
  }
}
