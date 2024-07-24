

CREATE TABLE public.child (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_ID UUID
    FOREIGN KEY(parent_ID) REFERENCES parent(id)
);

CREATE TABLE public.parent(
    id UUID NOT NULL UNIQUE,
)


