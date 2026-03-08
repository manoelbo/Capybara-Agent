"use client";

import {
  ChevronRight,
  File,
  Folder,
  GitBranch,
  History,
  MessageSquare,
  PanelRight,
  Play,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from "@/components/ui/sidebar";

type SidebarModule = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const sidebarModules: SidebarModule[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "explorer", label: "Explorer", icon: File },
  { id: "git", label: "Source Control", icon: GitBranch },
];

const changesData = [
  { file: "README.md", state: "M" },
  { file: "api/hello/route.ts", state: "U" },
  { file: "app/layout.tsx", state: "M" },
];

type TreeItem = string | TreeItem[];

const fileTreeData: TreeItem[] = [
  [
    "app",
    [
      "api",
      ["hello", ["route.ts"]],
      "page.tsx",
      "layout.tsx",
      ["blog", ["page.tsx"]],
    ],
  ],
  ["components", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
  ["lib", ["util.ts"]],
  ["public", "favicon.ico", "vercel.svg"],
  ".eslintrc.json",
  ".gitignore",
  "next.config.js",
  "tailwind.config.js",
  "package.json",
  "README.md",
];

function Logo({ className }: { className?: string }) {
  return (
    <img
      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
      alt="Logo"
      className={cn("size-5 dark:invert", className)}
    />
  );
}

function Tree({ item }: { item: TreeItem }) {
  const [name, ...items] = Array.isArray(item) ? item : [item];

  if (!items.length) {
    return (
      <SidebarMenuButton className="data-[active=true]:bg-transparent">
        <File className="size-4" />
        {name}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "app" || name === "components"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="size-4 transition-transform" />
            <Folder className="size-4" />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

export function AppSidebar({
  activeModule,
  onModuleChange,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
                  <img
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
                    alt="Shadcnblocks"
                    className="size-5 invert dark:invert-0"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Shadcnblocks</span>
                  <span className="truncate text-xs">my-project</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {sidebarModules.map((module) => (
                <SidebarMenuItem key={module.id}>
                  <SidebarMenuButton
                    tooltip={{
                      children: module.label,
                      hidden: false,
                    }}
                    onClick={() => onModuleChange(module.id)}
                    isActive={activeModule === module.id}
                    className="px-2.5 md:px-2"
                  >
                    <module.icon />
                    <span>{module.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{
                children: "Settings",
                hidden: false,
              }}
              className="px-2.5 md:px-2"
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{
                children: "Profile",
                hidden: false,
              }}
              className="px-2.5 md:px-2"
            >
              <User />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ExplorerSidebar() {
  return (
    <Sidebar
      collapsible="none"
      className="w-full shrink-0 border-r md:flex md:w-[280px]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {changesData.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>
                    <File className="size-4" />
                    <span className="truncate">{item.file}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge
                    className={cn(
                      "text-[10px] font-medium",
                      item.state === "M" && "text-yellow-500",
                      item.state === "U" && "text-green-500",
                      item.state === "D" && "text-red-500",
                    )}
                  >
                    {item.state}
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fileTreeData.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function SearchSidebar() {
  return (
    <Sidebar
      collapsible="none"
      className="w-full shrink-0 border-r md:flex md:w-[280px]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <div className="flex items-center rounded-md border bg-background px-3 py-2">
              <Search className="mr-2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function GitSidebar() {
  return (
    <Sidebar
      collapsible="none"
      className="w-full shrink-0 border-r md:flex md:w-[280px]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {changesData.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>
                    <File className="size-4" />
                    <span className="truncate">{item.file}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge
                    className={cn(
                      "text-[10px] font-medium",
                      item.state === "M" && "text-yellow-500",
                      item.state === "U" && "text-green-500",
                      item.state === "D" && "text-red-500",
                    )}
                  >
                    {item.state}
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

type MobileDrawer = "search" | "explorer" | "git" | "chat" | null;

export function ApplicationShell9() {
  const [activeModule, setActiveModule] = React.useState("explorer");
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [mobileDrawer, setMobileDrawer] = React.useState<MobileDrawer>(null);

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const renderSidebar = () => {
    switch (activeModule) {
      case "search":
        return <SearchSidebar />;
      case "explorer":
        return <ExplorerSidebar />;
      case "git":
        return <GitSidebar />;
      default:
        return <ExplorerSidebar />;
    }
  };

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "var(--sidebar-width-icon)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        className="hidden md:flex"
      />

      <div className="flex h-full w-full flex-col md:hidden">
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-3">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-7 items-center justify-center rounded-sm bg-primary">
              <img
                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
                alt="Shadcnblocks"
                className="size-4 invert dark:invert-0"
              />
            </div>
            <span className="text-sm font-medium">my-project</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
              <Plus className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <Settings className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center bg-muted/30">
          <Logo className="size-16 opacity-30" />
        </div>

        <div className="flex h-14 shrink-0 items-center justify-around border-t bg-background">
          <button
            type="button"
            onClick={() => setMobileDrawer("search")}
            className={cn(
              "flex items-center justify-center rounded-md p-2",
              mobileDrawer === "search"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Search className="size-5" />
            <span className="sr-only">Search</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawer("explorer")}
            className={cn(
              "flex items-center justify-center rounded-md p-2",
              mobileDrawer === "explorer"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <File className="size-5" />
            <span className="sr-only">Explorer</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawer("git")}
            className={cn(
              "flex items-center justify-center rounded-md p-2",
              mobileDrawer === "git"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <GitBranch className="size-5" />
            <span className="sr-only">Source Control</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawer("chat")}
            className={cn(
              "flex items-center justify-center rounded-md p-2",
              mobileDrawer === "chat"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <MessageSquare className="size-5" />
            <span className="sr-only">Chat</span>
          </button>
        </div>

        <Drawer
          open={mobileDrawer === "search"}
          onOpenChange={(open) => setMobileDrawer(open ? "search" : null)}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Search</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <div className="flex items-center rounded-md border bg-background px-3 py-2">
                <Search className="mr-2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer
          open={mobileDrawer === "explorer"}
          onOpenChange={(open) => setMobileDrawer(open ? "explorer" : null)}
        >
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Files</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="h-[60vh] [&>[data-slot=scroll-area-viewport]>div]:!block">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Changes</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {changesData.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            <File className="size-4" />
                            <span className="truncate">{item.file}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge
                            className={cn(
                              "text-[10px] font-medium",
                              item.state === "M" && "text-yellow-500",
                              item.state === "U" && "text-green-500",
                              item.state === "D" && "text-red-500",
                            )}
                          >
                            {item.state}
                          </SidebarMenuBadge>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>Files</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {fileTreeData.map((item, index) => (
                        <Tree key={index} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </ScrollArea>
          </DrawerContent>
        </Drawer>

        <Drawer
          open={mobileDrawer === "git"}
          onOpenChange={(open) => setMobileDrawer(open ? "git" : null)}
        >
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Source Control</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="h-[60vh] [&>[data-slot=scroll-area-viewport]>div]:!block">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Changes</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {changesData.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            <File className="size-4" />
                            <span className="truncate">{item.file}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge
                            className={cn(
                              "text-[10px] font-medium",
                              item.state === "M" && "text-yellow-500",
                              item.state === "U" && "text-green-500",
                              item.state === "D" && "text-red-500",
                            )}
                          >
                            {item.state}
                          </SidebarMenuBadge>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </ScrollArea>
          </DrawerContent>
        </Drawer>

        <Drawer
          open={mobileDrawer === "chat"}
          onOpenChange={(open) => setMobileDrawer(open ? "chat" : null)}
        >
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Chat</DrawerTitle>
            </DrawerHeader>
            <div className="flex h-[60vh] flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                    Build me a landing page for shadcnblocks with a hero
                    section, features grid, and pricing table
                  </div>
                </div>
              </ScrollArea>
              <div className="border-t p-3">
                <div className="rounded-lg border bg-background">
                  <textarea
                    placeholder="Describe what you want to build..."
                    rows={3}
                    className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between border-t px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Press Enter to send</span>
                    </div>
                    <Button size="sm" className="h-7 gap-1.5 px-3">
                      <span>Send</span>
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="hidden min-w-0 flex-1 flex-col overflow-hidden md:flex">
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
          <nav className="flex items-center gap-1 text-sm">
            <span className="font-medium">Shadcnblocks</span>
            <ChevronRight className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">my-project</span>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <Play className="size-4" />
              <span>Preview</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <Plus className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <History className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", isChatOpen && "bg-muted")}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <PanelRight className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {renderSidebar()}

          <SidebarInset className="min-h-0 flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
              <div
                className={cn(
                  "flex flex-1 items-center justify-center bg-muted/30",
                )}
              >
                {!isChatOpen ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Logo className="size-16 opacity-30" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Start building</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Describe what you want to create and let AI help you
                        build it
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsChatOpen(true)}
                      className="gap-2"
                    >
                      <MessageSquare className="size-4" />
                      Open Chat
                    </Button>
                  </div>
                ) : (
                  <Logo className="size-16 opacity-30" />
                )}
              </div>

              {isChatOpen && (
                <div className="flex w-[400px] shrink-0 flex-col border-l">
                  <div className="flex h-10 items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      <span className="text-sm font-medium">Chat</span>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                        Build me a landing page for shadcnblocks with a hero
                        section, features grid, and pricing table
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="border-t p-3">
                    <div className="rounded-lg border bg-background">
                      <textarea
                        placeholder="Describe what you want to build..."
                        rows={3}
                        className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center justify-between border-t px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Press Enter to send</span>
                        </div>
                        <Button size="sm" className="h-7 gap-1.5 px-3">
                          <span>Send</span>
                          <ChevronRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
