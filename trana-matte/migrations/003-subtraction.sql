BEGIN;
ALTER TABLE matte_practice_runs DROP CONSTRAINT IF EXISTS matte_practice_runs_operation_check;
ALTER TABLE matte_practice_runs ADD CONSTRAINT matte_practice_runs_operation_check
  CHECK (operation IN ('multiplication', 'crossword', 'addition', 'subtraction'));
COMMIT;
