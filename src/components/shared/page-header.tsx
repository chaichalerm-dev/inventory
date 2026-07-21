type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode; // action slot, e.g. a "New product" button
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-foreground/12 pb-5">
      <div className="relative border-l-[3px] border-primary pl-4">
        <h1 className="text-2xl font-bold tracking-[-0.03em] md:text-[2rem]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
