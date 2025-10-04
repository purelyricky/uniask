'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { Check, ChevronsUpDown, BookUser, CalendarDays, Globe, Phone, GraduationCap, DollarSign, Users, Building2, FlaskConical, HeadphonesIcon } from 'lucide-react'

import { getCookie, setCookie } from '@/lib/utils/cookies'
import universityTopics from '@/lib/config/university-topics.json'
import { useIsMobile } from '@/hooks/use-mobile'

import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface Topic {
    id: string;
    name: string;
    urls: string[];
}

const topicIcons: { [key: string]: React.ElementType } = {
  general: Globe,
  admissions: GraduationCap,
  programs: BookUser,
  international: Users,
  'fees-scholarships': DollarSign,
  'student-life': Users,
  academic: CalendarDays,
  faculties: Building2,
  research: FlaskConical,
  contact: HeadphonesIcon
};

export function TopicSelector() {
  const [open, setOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTopicId = getCookie('selectedTopic')
    if (savedTopicId) {
      const topic = universityTopics.topics.find(t => t.id === savedTopicId)
      setSelectedTopic(topic || null)
    }
  }, [])

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setCookie('selectedTopic', topic.id)
    setOpen(false)
  }

  const TopicIcon = selectedTopic ? topicIcons[selectedTopic.id] : Globe;

  // Prevent hydration mismatch by rendering desktop version on server
  if (!mounted) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="text-sm rounded-full shadow-none focus:ring-0"
              >
                <div className="flex items-center space-x-1">
                  <TopicIcon className="size-4" />
                  <span className="text-xs font-medium truncate">
                    {selectedTopic ? selectedTopic.name : 'Select Topic'}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Choose search topic</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search topics..." />
            <CommandList>
              <CommandEmpty>No topic found.</CommandEmpty>
              <CommandGroup>
                {universityTopics.topics.map(topic => {
                  const Icon = topicIcons[topic.id];
                  return (
                    <CommandItem
                      key={topic.id}
                      value={topic.name}
                      onSelect={() => handleTopicSelect(topic as Topic)}
                      className="flex justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="size-4" />
                        <span className="text-xs font-medium">
                          {topic.name}
                        </span>
                      </div>
                      <Check
                        className={`h-4 w-4 ${
                          selectedTopic?.id === topic.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start rounded-full shadow-none focus:ring-0"
              >
                <div className="flex items-center space-x-2">
                    <TopicIcon className="size-4" />
                    <span className="text-xs font-medium truncate">
                        {selectedTopic ? selectedTopic.name : 'Select a Topic'}
                    </span>
                </div>
              </Button>
            </DrawerTrigger>
          </TooltipTrigger>
          <TooltipContent>Choose search topic</TooltipContent>
        </Tooltip>
        <DrawerContent className="max-h-[80vh]">
          <div className="p-4">
            <h3 className="text-lg font-medium text-center mb-4">Choose a Topic</h3>
            <div className="flex flex-col gap-2">
              {universityTopics.topics.map(topic => {
                const Icon = topicIcons[topic.id];
                return (
                  <Button
                    key={topic.id}
                    variant="outline"
                    className="w-full justify-between h-14"
                    onClick={() => handleTopicSelect(topic as Topic)}
                  >
                    <div className="flex items-center gap-3">
                        <Icon className="size-5" />
                        <span className="font-medium">{topic.name}</span>
                    </div>
                    {selectedTopic?.id === topic.id && <Check className="h-4 w-4" />}
                  </Button>
                )
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
            <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="text-sm rounded-full shadow-none focus:ring-0"
                    >
                        <div className="flex items-center space-x-1">
                            <TopicIcon className="size-4" />
                            <span className="text-xs font-medium truncate">
                                {selectedTopic ? selectedTopic.name : 'Select Topic'}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Choose search topic</TooltipContent>
        </Tooltip>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search topics..." />
          <CommandList>
            <CommandEmpty>No topic found.</CommandEmpty>
            <CommandGroup>
              {universityTopics.topics.map(topic => {
                const Icon = topicIcons[topic.id];
                return (
                    <CommandItem
                        key={topic.id}
                        value={topic.name}
                        onSelect={() => handleTopicSelect(topic as Topic)}
                        className="flex justify-between"
                    >
                        <div className="flex items-center space-x-2">
                        <Icon className="size-4" />
                        <span className="text-xs font-medium">
                            {topic.name}
                        </span>
                        </div>
                        <Check
                        className={`h-4 w-4 ${
                            selectedTopic?.id === topic.id ? 'opacity-100' : 'opacity-0'
                        }`}
                        />
                    </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}