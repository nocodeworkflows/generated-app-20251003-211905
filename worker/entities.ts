import { IndexedEntity } from "./core-utils";
import type { User, Tool, Contribution, Review } from "@shared/types";
import { MOCK_TOOLS } from "@shared/mock-data";
// USER ENTITY
export type UserState = User & { hashedPassword?: string };
export class UserEntity extends IndexedEntity<UserState> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: UserState = {
    id: "",
    email: "",
    credits: 0,
    unlockedTools: [],
    createdAt: 0,
    isAdmin: false,
  };
  // We use email as the key for users
  static override keyOf = (state: UserState): string => state.email;
}
// TOOL ENTITY
export class ToolEntity extends IndexedEntity<Tool> {
  static readonly entityName = "tool";
  static readonly indexName = "tools";
  static readonly initialState: Tool = {
    id: "",
    title: "",
    description: "",
    category: "",
    cost: 0,
    tags: [],
    imageUrl: "",
    content: "",
    rating: 0,
    reviewCount: 0,
  };
  static seedData = MOCK_TOOLS;
}
// CONTRIBUTION ENTITY
export class ContributionEntity extends IndexedEntity<Contribution> {
  static readonly entityName = "contribution";
  static readonly indexName = "contributions";
  static readonly initialState: Contribution = {
    id: "",
    userId: "",
    userEmail: "",
    toolName: "",
    toolUrl: "",
    description: "",
    status: "pending",
    createdAt: 0,
  };
}
// REVIEW ENTITY
export class ReviewEntity extends IndexedEntity<Review> {
  static readonly entityName = "review";
  static readonly indexName = "reviews";
  static readonly initialState: Review = {
    id: "",
    userId: "",
    userEmail: "",
    toolId: "",
    rating: 0,
    comment: "",
    createdAt: 0,
  };
}