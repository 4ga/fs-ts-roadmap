export type Widget = {
  id: string;
  name: string;
  createdAt: string;
};

export type IdGen = { nextId: () => string };
export type Clock = { nowISO: () => string };

export type WidgetsStore = {
  create: (name: string) => Widget;
  list: (opts: { limit: number; offset: number }) => {
    items: Widget[];
    total: number;
  };
  get: (id: string) => Widget | undefined;
  update: (id: string, name: string) => Widget | undefined;
  remove: (id: string) => boolean;
};

export const createWidgetsStore = ({
  idGen,
  clock,
}: {
  idGen: IdGen;
  clock: Clock;
}): WidgetsStore => {
  const byId = new Map<string, Widget>();

  function create(name: string): Widget {
    const widget: Widget = {
      id: idGen.nextId(),
      name,
      createdAt: clock.nowISO(),
    };

    byId.set(widget.id, widget);
    return widget;
  }

  function list(opts: { limit: number; offset: number }) {
    const all = Array.from(byId.values());
    const total = all.length;
    const items = all.slice(opts.offset, opts.offset + opts.limit);
    return { items, total };
  }

  function get(id: string) {
    return byId.get(id);
  }

  function update(id: string, name: string) {
    const existing = byId.get(id);
    if (!existing) return undefined;

    const updated: Widget = { ...existing, name };
    byId.set(id, updated);
    return updated;
  }

  function remove(id: string) {
    return byId.delete(id);
  }

  return { create, list, get, update, remove };
};
