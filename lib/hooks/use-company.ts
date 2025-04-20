import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const companyApiHooks = createApiHooks(companyService);