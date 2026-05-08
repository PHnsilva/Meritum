-- Seed initial partner institutions for local development and demos.
INSERT INTO "institutions" ("id", "name", "created_at", "updated_at")
VALUES
  ('0d8541f0-6de7-4c12-9f0d-d02f627cb709', 'PUC Minas - Campus Lourdes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('3c4ce0c6-8e25-48f1-b390-671db82bd0e5', 'PUC Minas - Campus Coracao Eucaristico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('6e7bd744-7c7b-4df9-929e-f0b5d3e10276', 'PUC Minas - Praca da Liberdade', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
